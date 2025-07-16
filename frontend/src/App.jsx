// frontend/src/App.jsx

import React, { useContext, useState } from 'react';
import { WebSocketContext } from './WebSocketProvider';
import PasswordPrompt from './PasswordPrompt';
import VerticalSplitter from './VerticalSplitter';
import FileTree from './components/FileTree';
import TabManager from './components/TabManager';
import { TabContext } from './components/TabContext';

const App = () => {
  const [openTabs, setOpenTabs]   = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  const openFile = (path) => {
    setOpenTabs(prev => (prev.includes(path) ? prev : [...prev, path]));
    setActiveTab(path);
  };

  const { authenticated, status } = useContext(WebSocketContext);

  if (status === 'disconnected') {
    return <p>Disconnected from server...</p>;
  }

  if (!authenticated) {
    return <PasswordPrompt />;
  }

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
        left={<FileTree />}
        right={<TabManager />}
      />
    </TabContext.Provider>
  );
};

export default App;
