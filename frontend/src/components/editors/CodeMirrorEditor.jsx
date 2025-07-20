import React, { useEffect, useRef } from 'react';
import { basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark'; // Dark theme
import { useGlobal } from '../../GlobalContext';

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

export default function CodeMirrorEditor({ value, onChange, onSave }) {
  const wrapperRef = useRef(null);
  const viewRef = useRef(null);

  const { state } = useGlobal();
  const darkMode = state.config.darkMode;

  // Initial mount
  useEffect(() => {
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const text = update.state.doc.toString();
        onChange(text);
      }
    });

    const editorState = EditorState.create({
      doc: value,
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

  // External updates to value
  useEffect(() => {
    if (!viewRef.current) return;

    const current = viewRef.current.state.doc.toString();
    if (current !== value) {
      viewRef.current.dispatch({
        changes: { from: 0, to: current.length, insert: value }
      });
    }
  }, [value]);

  return <div ref={wrapperRef} style={{ height: '100%' }} />;
}
