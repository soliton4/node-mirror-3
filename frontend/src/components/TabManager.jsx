// frontend/src/components/TabManager.jsx

import React, { useContext, useEffect, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { TabContext } from './TabContext';
import FileView from './FileView';

const TabManager = () => {
  const { openTabs, activeTab, closeTab } = useContext(TabContext);
  const [internalActive, setInternalActive] = useState(null);

  // Set last opened tab as active when tabs change
  useEffect(() => {
    if (openTabs.length > 0) {
      setInternalActive(openTabs[openTabs.length - 1]);
    } else {
      setInternalActive(null);
    }
  }, [openTabs]);

  if (openTabs.length === 0) {
    return <div className="editor-pane">No file open</div>;
  }

  return (
    <Tabs.Root
      className="editor-pane"
      value={internalActive}
      onValueChange={setInternalActive}
    >
      <Tabs.List className="tab-list">
        {openTabs.map((tabId) => (
          <Tabs.Trigger
            key={tabId}
            className={`tab-trigger ${internalActive === tabId ? 'active' : ''}`}
            value={tabId}
          >
            <span>{tabId.split('/').pop()}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tabId);
              }}
              className="close-btn"
            >
              ×
            </button>
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {openTabs.map((tabId) => (
        <Tabs.Content key={tabId} value={tabId} className="editor-container" forceMount>
          <FileView id={tabId} />
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};

export default TabManager;
