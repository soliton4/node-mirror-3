import React, { useEffect, useRef } from 'react';
import {basicSetup} from "codemirror"
import {EditorState} from "@codemirror/state"
import {EditorView} from "@codemirror/view"
import { javascript } from '@codemirror/lang-javascript';

const fullHeightTheme = EditorView.theme({
  "&": {
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  ".cm-scroller": {
    flex: 1,
    overflow: "auto"
  }
});

export default function CodeMirrorEditor({ file, value, onChange, onSave }) {
  const wrapperRef = useRef(null);
  const viewRef    = useRef(null);

  /* Initial mount */
  useEffect(() => {
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const text = update.state.doc.toString();
        onChange(text);
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [basicSetup, javascript(), updateListener, fullHeightTheme]
    });

    viewRef.current = new EditorView({
      state,
      parent: wrapperRef.current
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
  }, [file]);

  /* External updates to value (buffer change elsewhere) */
  useEffect(() => {
    console.log("value:" + value);
    if (!viewRef.current) return;

    const current = viewRef.current.state.doc.toString();

    // Only update editor content if external change occurred
    if (current !== value) {
      viewRef.current.dispatch({
        changes: { from: 0, to: current.length, insert: value }
      });
    }
  }, [value]);

  return <div ref={wrapperRef} style={{height:'100%'}} />;
}
