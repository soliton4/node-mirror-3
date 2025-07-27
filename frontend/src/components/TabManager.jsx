// frontend/src/components/TabManager.jsx

import React, { useContext, useEffect, useRef, useState } from 'react';

import * as Tabs from '@radix-ui/react-tabs';
import { useTabs } from './TabContext';
import FileView from './FileView';
import TerminalView from './TerminalView';
import emptyStateImage from '../images/logo_1.png';

const TabManager = () => {
  const tabApi = useTabs();

  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const tabRefs = useRef({});

  useEffect(() => {
    const timeout = setTimeout(() => {
      const ref = tabRefs.current[activeTab];
      ref?.current?.focus?.();
    }, 0);
    return () => clearTimeout(timeout);
  }, [activeTab]);


  // Expose `open(id)` to the context
  useEffect(() => {
    tabApi.open = (type, id, name) => {
      const key = `${type}:${id}`;
    
      setOpenTabs((prev) => {
        const exists = prev.find((t) => t.key === key);
        if (exists) return prev;
        return [...prev, { key, type, id, name, dirty: false, changed: false }];
      });
    
      setActiveTab(key);
    };
  }, [tabApi]);

  const closeTab = (key) => {
    setOpenTabs((prev) => prev.filter((t) => t.key !== key));
    if (activeTab === key) {
      const idx = openTabs.findIndex((t) => t.key === key);
      const next = openTabs[idx + 1]?.key || openTabs[idx - 1]?.key || null;
      setActiveTab(next);
    }
  };

  if (openTabs.length === 0) {
    return (
      <div
        className="editor-pane image-wrapper"
        style={{ backgroundColor: '#000417' }}
      >
        <img src={emptyStateImage} alt="No file open"  className="image-fit" />
      </div>
    );
  }
 
  return (
    <Tabs.Root
      className="editor-pane"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <Tabs.List className="tab-list">
        {openTabs.map((tab) => (
          <Tabs.Trigger
            key={tab.key}
            className="tab-trigger"
            value={tab.key}
          >
            <span>
              {tab.name}
              {tab.dirty && ' *'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.key);
              }}
              className="close-btn"
            >
              ×
            </button>
          </Tabs.Trigger>
        ))}

      </Tabs.List>

      {openTabs.map((tab) => {
        let content;

        const ref = (tabRefs.current[tab.key] ||= React.createRef());
      
        if (tab.type === 'file') {
          content = <FileView id={tab.id} ref={ref}/>;
        } else if (tab.type === 'terminal') {
          content = <TerminalView id={tab.id} ref={ref}/>;
        } else {
          content = <div>Unknown tab type</div>;
        }
      
        return (
          <Tabs.Content key={tab.key} value={tab.key} className="editor-container" forceMount>
            {content}
          </Tabs.Content>
        );
      })}

    </Tabs.Root>
  );
};

export default TabManager;
