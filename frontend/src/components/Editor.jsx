import React from 'react';

export default function Editor({ openTabs, activeTab, setActiveTab, closeTab }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ccc', background: '#eee' }}>
        {openTabs.map((tabPath) => (
          <div
            key={tabPath}
            onClick={() => setActiveTab(tabPath)}
            style={{
              padding: '5px 10px',
              cursor: 'pointer',
              background: activeTab === tabPath ? '#fff' : '#ddd',
              borderTop: '1px solid #ccc',
              borderLeft: '1px solid #ccc',
              borderRight: '1px solid #ccc',
            }}
          >
            {tabPath.split('/').pop()}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tabPath);
              }}
              style={{ marginLeft: 5 }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Editor area */}
      <div style={{ padding: 20 }}>
        {activeTab ? (
          <div>content of file: <strong>{activeTab}</strong></div>
        ) : (
          <em>No file selected</em>
        )}
      </div>
    </div>
  );
}
