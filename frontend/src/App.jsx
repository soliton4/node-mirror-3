// frontend/src/App.jsx

import React, { useContext, useEffect, useState, useRef } from 'react';

import { WebSocketContext } from './WebSocketProvider';
import PasswordPrompt from './PasswordPrompt';
import VerticalSplitter from './VerticalSplitter';
import Navigation from './components/Navigation';
import TabManager from './components/TabManager';
import { TabContext } from './components/TabContext';
import { useGlobal } from './GlobalContext';

const App = () => {
  const tabApi = useRef({ open: () => {} });


  /* ---------- Global config ---------- */
  const { state, updateConfig } = useGlobal();
  const  darkMode               = state.config.darkMode;
  const  toggleDarkMode         = () =>
    updateConfig({ darkMode: !darkMode });


  // Apply dark mode class to body
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);


  /* ---------- WebSocket auth ---------- */
  const { authenticated, status } = useContext(WebSocketContext);


  if (status === 'disconnected') {
    return <p>Disconnected from server...</p>;
  }

  if (!authenticated) {
    return <PasswordPrompt />;
  }

  return (
    <TabContext.Provider value={tabApi.current}>
      <VerticalSplitter
        left={
          <Navigation darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
        }
        right={<TabManager />}
      />
    </TabContext.Provider>
  );
};

export default App;




