import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark'; // Dark theme
import { useGlobal } from '../../GlobalContext';
import File from '../../../../shared/objects/File';

const fullHeightTheme = EditorView.theme({
  "&": {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  ".cm-scroller": {
    flex: 1,
    overflow: "auto",
  }
});

const CodeMirrorEditor = forwardRef(({ id, setToolbarExtras }, ref) => {
  const wrapperRef = useRef(null);
  const viewRef = useRef(null);
  const fileRef = useRef(null); // Store File instance
  const currentContent = useRef('');

  const { state } = useGlobal();
  const darkMode = state.config.darkMode;

  const fileExtension = id ? id.split('.').pop().toLowerCase() : "";

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

  const onChange = (text) => {
    currentContent.current = text;
    fileRef.current?.setContent(text);
  };

  const onSave = () => {
    fileRef.current?.save();
  };


  useImperativeHandle(ref, () => ({
    async reload() {
      const content = await fileRef.current?.reload();
      if (content != null) {
        updateEditor(content);
        currentContent.current = content;
      }
    }
  }));


  useEffect(() => {
    const file = File(id);
    fileRef.current = file;

    const fetch = async () => {
      const v = await file.getContent();

      updateEditor(v);
    };
    fetch();


    return () => {
      file.done(); // <-- will be called when the component unmounts or dependencies change
      fileRef.current = null;
    };
  }, [id]);


  // Initial mount
  useEffect(() => {
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const text = update.state.doc.toString();
        onChange(text);
      }
    });

    const editorState = EditorState.create({
      extensions: [
        basicSetup,
        javascript(),
        updateListener,
        fullHeightTheme,
        darkMode ? oneDark : EditorView.theme({}, { dark: false })
      ]
    });

    viewRef.current = new EditorView({
      state: editorState,
      parent: wrapperRef.current,
    });

    const saveKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        onSave();
      }
    };
    document.addEventListener('keydown', saveKey);

    return () => {
      viewRef.current?.destroy();
      document.removeEventListener('keydown', saveKey);
    };
  }, [darkMode]);


  return <div ref={wrapperRef} style={{ height: '100%' }} />;
});

export default CodeMirrorEditor;
