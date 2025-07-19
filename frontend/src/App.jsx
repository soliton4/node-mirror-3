// frontend/src/App.jsx

import React, { useContext, useEffect, useState } from 'react';
import { WebSocketContext } from './WebSocketProvider';
import PasswordPrompt from './PasswordPrompt';
import VerticalSplitter from './VerticalSplitter';
import FileTree from './components/FileTree';
import TabManager from './components/TabManager';
import { TabContext } from './components/TabContext';
import { useGlobal } from './GlobalContext';

const App = () => {
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);


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


  /* ---------- tab helpers ---------- */
  const openFile = (path) => {
    setOpenTabs((prev) => (prev.includes(path) ? prev : [...prev, path]));
    setActiveTab(path);
  };

  const closeTab = (path) => {
    setOpenTabs((prev) => prev.filter((p) => p !== path));
    if (activeTab === path) {
      const index = openTabs.indexOf(path);
      const next = openTabs[index + 1] || openTabs[index - 1] || null;
      setActiveTab(next);
    }
  };


  return (
    <TabContext.Provider value={{ openTabs, activeTab, openFile, closeTab }}>
      <VerticalSplitter
        left={
          <FileTree darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
        }
        right={<TabManager />}
      />
    </TabContext.Provider>
  );
};

export default App;
