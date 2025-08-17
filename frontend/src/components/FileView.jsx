import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import File from '../../../shared/objects/File';
import ReactCodeMirrorEditor from './editors/ReactCodeMirrorEditor';
//import CodeMirrorEditor from './editors/CodeMirrorEditor';
import HexEditor from './editors/HexEditor';
import { useGlobal } from '../GlobalContext';
import { useConfig } from '../ConfigContext';

import { Save, RefreshCw } from 'lucide-react';

const FileView = forwardRef(({ id, statusChange }, ref) => {

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (reactCodeMirrorEditorRef && reactCodeMirrorEditorRef.current){
        reactCodeMirrorEditorRef.current.focus();
      }
    },
    getContext: () => {
      console.log("calling getcontext");
      if (reactCodeMirrorEditorRef && reactCodeMirrorEditorRef.current){
        return reactCodeMirrorEditorRef.current.getContext();
      };
    }
  }), []);

  const { config } = useConfig();
  const darkMode = config.appearance === 'dark';

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
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

    const updateStatus = async ()=>{
      const status = await file.getStatus();
      if (statusChange){
        statusChange(id, status);
      }
    };
    updateStatus();

    const unsubscribe = file.on("change", (status)=>{
      if (statusChange){
        statusChange(id, status);
      }
    });
    
    return ()=>{
      unsubscribe();
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
    <div class="file-view" style={containerStyle}>
      {/* ---- control bar ---- */}
      <div class="toolbar">
        <select style={selectStyle} value={mode} onChange={e => setMode(e.target.value)}>
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
});

export default FileView;
