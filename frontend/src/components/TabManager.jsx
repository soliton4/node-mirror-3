import React from 'react';
import FileView from './FileView';
import { useTabs } from './TabContext'; 
import { useGlobal } from '../GlobalContext';

export default function TabManager() {
  const { openTabs, activeTab, closeTab, openFile } = useTabs();
  const { state } = useGlobal();
  const darkMode = state.config.darkMode;

  const tabHeaderStyle = {
    display: 'flex',
    background: darkMode ? '#2c2c2c' : '#eee',
    borderBottom: '1px solid #444',
  };

  const tabStyle = (path) => ({
    padding: '4px 8px',
    cursor: 'pointer',
    background: activeTab === path
      ? (darkMode ? '#1e1e1e' : '#fff')
      : (darkMode ? '#3a3a3a' : '#ddd'),
    border: '1px solid #555',
    borderBottom: 'none',
    color: darkMode ? '#eee' : '#000',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ---- tab header ---- */}
      <div style={tabHeaderStyle}>
        {openTabs.map(path => (
          <div key={path}
               onClick={() => openFile(path)}
               style={tabStyle(path)}>
            {path.split('/').pop()}
            <span onClick={(e) => {
              e.stopPropagation();
              closeTab(path);
            }} style={{ marginLeft: 4 }}>×</span>
          </div>
        ))}
      </div>

      {/* ---- content ---- */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {activeTab
          ? <FileView key={activeTab} path={activeTab} />
          : <em style={{ padding: 16 }}>No file selected</em>}
      </div>
    </div>
  );
}
