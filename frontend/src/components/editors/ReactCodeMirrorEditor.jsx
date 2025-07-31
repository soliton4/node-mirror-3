import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useGlobal } from '../../GlobalContext';
import CodeMirror from '@uiw/react-codemirror';
import { languages } from '@codemirror/language-data';
import File from '../../../../shared/objects/File';
import DoubleTimeout from '../../../../shared/DoubleTimeout.js';
import { useConfig } from '../../ConfigContext';
import themes from '@uiw/codemirror-themes'

// Sorted list of languages by name
const sortedLanguages = [...languages].sort((a, b) =>
  a.name.localeCompare(b.name)
);

const ReactCodeMirrorEditor = forwardRef(({ id, setToolbarExtras }, ref) => {
  const wrapperRef = useRef(null); // our node
  const viewRef = useRef(null); // codemirror
  const fileRef = useRef(null); // the file object

  const localContent = useRef("");
  const transmittingContent = useRef(null);
  const lastTransmittedContent = useRef(null);


  // style
  const { config } = useConfig();
  const { state } = useConfig();

  const [languageExtension, setLanguageExtension] = useState(null);
  const [selectedLangName, setSelectedLangName] = useState(null);

  const transmit = async () => {
    if (transmittingContent.current !== null){
      transmitTimeout.current.trigger();
      return;
    };
    transmittingContent.current = localContent.current;
    if (fileRef.current){
      await fileRef.current.setContent(transmittingContent.current);
    }
    lastTransmittedContent.current = transmittingContent.current;
    transmittingContent.current = null;
  }
  const transmitTimeout = useRef(DoubleTimeout(transmit, 5000, 1000));

  // editor changed
  const onChange = (text) => {

    if (text === localContent.current){
      return;
    }
    localContent.current = text;
    transmitTimeout.current.trigger();
  };


  const updateEditor = (newText) => {
    const view = viewRef.current;
    if (!view) return;
  
    const currentText = view.state.doc.toString();
    if (newText === currentText) return;
  
    // Capture scroll position
    const scrollDOM = view.scrollDOM;
    const scrollTop = scrollDOM.scrollTop;
    const scrollLeft = scrollDOM.scrollLeft;
  
    // Preserve current selection
    const { state } = view;
    const selection = state.selection;
  
    view.dispatch({
      changes: { from: 0, to: state.doc.length, insert: newText },
      selection,
      userEvent: "update"
    });
  
    // Restore scroll position
    requestAnimationFrame(() => {
      scrollDOM.scrollTop = scrollTop;
      scrollDOM.scrollLeft = scrollLeft;
    });
  
    localContent.current = newText;
  };



  // this is the implementation of data arriving from remote
  const changeFromServer = (text)=>{
    if (text === transmittingContent.current){
      // we got the content back that we just transmitted;
      return;
    }
    if (text === lastTransmittedContent.current){
      // we got the content back that we just transmitted;
      return;
    }
    if (text === localContent.current){
      // this is what our editor is showing right now
      return;
    }

    updateEditor(text);

  };

  const onServerChange = async (status)=>{
    // file changed on the server
    if (fileRef.current){
      const content = await fileRef.current?.getContent();
      if (content != null) {
        changeFromServer(content);
      }
    };
  };

  useEffect(() => {
    const file = File(id);
    fileRef.current = file;
    const unsubscribe = file.on("change", onServerChange);

    const fetch = async () => {
      const v = await file.getContent();

      changeFromServer(v);
    };
    fetch();


    // Set initial language based on file extension
    const fileExtension = id ? id.split('.').pop().toLowerCase() : "";
    const initialLang = languages.find((l) =>
      l.extensions?.includes(fileExtension)
    );
    if (initialLang) {
      setSelectedLangName(initialLang.name);
    }


    return () => {
      unsubscribe();
      file.done(); // <-- will be called when the component unmounts or dependencies change
      fileRef.current = null;
    };
  }, [id]);


  useImperativeHandle(ref, () => ({
    async reload() {
      const content = await fileRef.current?.reload();
      if (content != null) {
        updateEditor(content);
      }
    }
  }));


  // Load language extension based on selected language name
  useEffect(() => {
    const loadLanguageByName = async () => {
      const lang = languages.find((l) => l.name === selectedLangName);
      if (lang?.load) {
        const ext = await lang.load();
        setLanguageExtension(ext);
      } else {
        setLanguageExtension(null);
      }
    };

    loadLanguageByName();
  }, [selectedLangName]);


  // Mount/dismount select in toolbar
  useEffect(() => {
    if (!setToolbarExtras) return;

    const select = (
      <select
        key="lang-select"
        value={selectedLangName || ''}
        style={{ marginLeft: 'auto' }}
        onChange={(e) => setSelectedLangName(e.target.value)}
      >
        {sortedLanguages.map((lang) => (
          <option key={lang.name} value={lang.name}>
            {lang.name}
          </option>
        ))}
      </select>
    );

    setToolbarExtras(select);
    return () => setToolbarExtras(null);
  }, [setToolbarExtras, selectedLangName]);


  // Build list of extensions
  const extensions = [];
  if (languageExtension) extensions.push(languageExtension);

  

  const onSave = () => {
    fileRef.current?.save();
  };

  return <div
    ref={wrapperRef}
    style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
    }}
    >
      <CodeMirror 
        style={{ height: '100%', overflow: 'auto' }}
        height="100%"
        maxHeight="100%" // ← this forces internal scroll
        extensions={extensions}
        onChange={onChange} 
        theme={config.appearance}
        onCreateEditor={(view) => {
          viewRef.current = view;
        }}
        />
    </div>;
  
});

export default ReactCodeMirrorEditor;


