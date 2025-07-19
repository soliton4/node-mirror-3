// frontend/src/components/FileTreeToolbar.jsx

import React from 'react';
import { useGlobal } from '../GlobalContext';

export default function FileTreeToolbar({ }) {

  const { state, updateConfig } = useGlobal();
  const darkMode = state.config.darkMode;

  const toggleDarkMode = () => {
    updateConfig({ darkMode: !darkMode });
  };
  
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '6px',
        borderBottom: '1px solid #ccc',
      }}
    >
      <button
        onClick={toggleDarkMode}
        title="Toggle dark mode"
        style={{
          background: darkMode ? '#444' : '#eee',
          color: darkMode ? '#fff' : '#000',
          border: 'none',
          borderRadius: '4px',
          padding: '4px 8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '0.9em',
          transition: 'background 0.3s ease',
        }}
      >
        {darkMode ? '☀️ Light' : '🌙 Dark'}
      </button>
    </div>
  );
}
