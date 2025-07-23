import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useGlobal } from '../../GlobalContext';
import CodeMirror from '@uiw/react-codemirror';
import { languages } from '@codemirror/language-data';
import File from '../../../../shared/objects/File';

// Sorted list of languages by name
const sortedLanguages = [...languages].sort((a, b) =>
  a.name.localeCompare(b.name)
);

//console.log(sortedLanguages);

const ReactCodeMirrorEditor = forwardRef(({ id, setToolbarExtras }, ref) => {
  const wrapperRef = useRef(null); // our node
  const viewRef = useRef(null); // codemirror
  const fileRef = useRef(null); // the file object
  const currentContent = useRef("");

  // style
  const { state } = useGlobal();
  const darkMode = state.config.darkMode;

  const [languageExtension, setLanguageExtension] = useState(null);
  const [selectedLangName, setSelectedLangName] = useState(null);


  const updateEditor = (value) => {
    currentContent.current = value;
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      changes: {
        from: 0,
        to: viewRef.current.state.doc.length,
        insert: value
      }
    });
  };

  useEffect(() => {
    const file = File(id);
    fileRef.current = file;

    const fetch = async () => {
      const v = await file.getContent();

      updateEditor(v);
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

  

  const onChange = (text) => {
    if (text === currentContent.current){
      return;
    }
    fileRef.current?.setContent(text);
  };

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
        theme={darkMode ? 'dark' : 'light'}
        onCreateEditor={(view) => {
          viewRef.current = view;
        }}
        />
    </div>;
  
});

export default ReactCodeMirrorEditor;


