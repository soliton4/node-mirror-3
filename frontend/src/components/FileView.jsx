import React, { useState, useEffect } from 'react';
import openFile from '../../../shared/objects/File';
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

  
  const fileExtension = id ? id.split('.').pop().toLowerCase() : "";

  const [toolbarExtras, setToolbarExtras] = useState(null);

  
  const fileObj = openFile(id);
  const [mode, setMode] = useState('react-codemirror');
  const [buffer, setBuffer] = useState('');

  useEffect(() => {
    (async () => {
      const content = await fileObj.getContent();
      setBuffer(content);
    })();
  }, [fileObj]);

  const updateBuffer = (text) => fileObj.setContent(text).then(() => setBuffer(text));
  const saveFile     = () => fileObj.save();
  const reloadFile   = async () => {
    const content = await fileObj.reload();
    setBuffer(content);
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
          <CodeMirrorEditor value={buffer} onChange={updateBuffer} fileExtension={fileExtension} />
        )}
        {mode === 'react-codemirror' && (
          <ReactCodeMirrorEditor 
            valuePar={buffer} 
            onChangePar={updateBuffer} 
            fileExtension={fileExtension} 
            setToolbarExtras={setToolbarExtras}
            />
        )}
        {mode === 'hex' && (
          <HexEditor value={buffer} onChange={updateBuffer} />
        )}
      </div>
    </div>
  );
}


