import React from 'react';
import FileView from './FileView';
import { useTabs } from './TabContext'; // ✅ correct

export default function TabManager() {
  const { openTabs, activeTab, closeTab, openFile } = useTabs();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ---- tab header ---- */}
      <div style={{ display: 'flex', background: '#eee', borderBottom: '1px solid #ccc' }}>
        {openTabs.map(path => (
          <div key={path}
               onClick={() => openFile(path)}
               style={{
                 padding: '4px 8px',
                 cursor: 'pointer',
                 background: activeTab === path ? '#fff' : '#ddd',
                 border: '1px solid #ccc',
                 borderBottom: 'none'
               }}>
            {path.split('/').pop()}
            <span onClick={(e) => {
              e.stopPropagation();
              closeTab(path);
            }} style={{ marginLeft: 4 }}>×</span>
          </div>
        ))}
      </div>

      {/* ---- content ---- */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab
          ? <FileView key={activeTab} path={activeTab} />
          : <em style={{ padding: 16 }}>No file selected</em>}
      </div>
    </div>
  );
}
