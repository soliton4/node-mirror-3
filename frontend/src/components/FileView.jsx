import React, { useState, useEffect, useRef } from 'react';
import File from '../../../shared/objects/File';
import ReactCodeMirrorEditor from './editors/ReactCodeMirrorEditor';
import CodeMirrorEditor from './editors/CodeMirrorEditor';
import HexEditor from './editors/HexEditor';
import { useGlobal } from '../GlobalContext';

import { Save, RefreshCw } from 'lucide-react';

export default function FileView({ id }) {

  const { state } = useGlobal();
  const darkMode = state.config.darkMode;

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: darkMode ? '#1e1e1e' : '#fff',
    color: darkMode ? '#eee' : '#000',
  };

  const toolbarStyle = {
    background: darkMode ? '#2c2c2c' : '#f7f7f7',
    borderBottom: darkMode ? '1px solid #444' : '1px solid #ccc',
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const iconButtonStyle = {
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    color: darkMode ? '#eee' : '#000',
  };

  const selectStyle = {
    background: darkMode ? '#444' : '#fff',
    color: darkMode ? '#eee' : '#000',
    border: '1px solid #888',
    padding: '2px 6px',
  };

  const fileRef = useRef(null);

  
  const fileExtension = id ? id.split('.').pop().toLowerCase() : "";

  const [toolbarExtras, setToolbarExtras] = useState(null);

  
  const [mode, setMode] = useState('react-codemirror');

  const reactCodeMirrorEditorRef = useRef(null);

  useEffect(() => {
    const file = File(id);
    fileRef.current = file;
    return ()=>{
      file.done();
      fileRef.current = null;

    };
  }, [id]);

  const saveFile     = () => {
    if (fileRef.current){
      fileRef.current.save()
    };
  };
  const reloadFile   = async () => {
    if (reactCodeMirrorEditorRef.current){
      reactCodeMirrorEditorRef.current.reload();
    }
  };

  return (
    <div style={containerStyle}>
      {/* ---- control bar ---- */}
      <div style={toolbarStyle}>
        <select style={selectStyle} value={mode} onChange={e => setMode(e.target.value)}>
          <option value="codemirror">CodeMirror</option>
          <option value="react-codemirror">ReactCodeMirror</option>
          <option value="hex">Hex editor</option>
        </select>

        <button onClick={saveFile} title="Save" style={iconButtonStyle}>
          <Save size={18} />
        </button>
        <button onClick={reloadFile} title="Reload" style={iconButtonStyle}>
          <RefreshCw size={18} />
        </button>

        {/* 🔌 Slot for additional toolbar controls */}
        {toolbarExtras}
      </div>

      {/* ---- editor area ---- */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0, // ← this is the key
      }}>
        {mode === 'codemirror' && (
          <CodeMirrorEditor id={id} fileExtension={fileExtension} />
        )}
        {mode === 'react-codemirror' && (
          <ReactCodeMirrorEditor 
            id={id}
            ref={reactCodeMirrorEditorRef}
            setToolbarExtras={setToolbarExtras}
            />
        )}
        {mode === 'hex' && (
          <HexEditor />
        )}
      </div>
    </div>
  );
}


