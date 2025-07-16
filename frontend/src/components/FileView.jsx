import React, { useState, useEffect } from 'react';
import openFile from '../../../shared/objects/File';
import CodeMirrorEditor from './editors/CodeMirrorEditor';
import HexEditor from './editors/HexEditor';

import { Save, RefreshCw } from 'lucide-react';

export default function FileView({ path }) {
  const fileObj = openFile(path);
  const [mode, setMode] = useState('text');
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ---- control bar ---- */}
      <div style={{
        background: '#f7f7f7',
        borderBottom: '1px solid #ccc',
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <select value={mode} onChange={e => setMode(e.target.value)}>
          <option value="text">Text editor</option>
          <option value="hex">Hex editor</option>
        </select>

        <button onClick={saveFile} title="Save" style={iconButtonStyle}><Save size={18} /></button>
        <button onClick={reloadFile} title="Reload" style={iconButtonStyle}><RefreshCw size={18} /></button>
      </div>

      {/* ---- editor area ---- */}
      <div style={{ flex: 1 }}>
        {mode === 'text' && (
          <CodeMirrorEditor file={fileObj} value={buffer} onChange={updateBuffer} onSave={saveFile} />
        )}
        {mode === 'hex' && (
          <HexEditor value={buffer} onChange={updateBuffer} onSave={saveFile} />
        )}
      </div>
    </div>
  );
}

const iconButtonStyle = {
  background: 'none',
  border: 'none',
  padding: '4px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center'
};
