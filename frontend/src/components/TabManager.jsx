// frontend/src/components/TabManager.jsx

import React, { useContext, useEffect, useRef, useState } from 'react';

import { Tabs, Flex, Box, Text, Button } from '@radix-ui/themes';
import { Cross1Icon } from '@radix-ui/react-icons';
import { useTabs } from './TabContext';
import FileView from './FileView';
import TerminalView from './TerminalView';
import emptyStateImage from '../images/logo_1.png';
import '../tabs/tabs.css';

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


  const statusChange = (id, status) => {
    const key = `file:${id}`;
    console.log("status: " + key);
    console.log(status);
    setOpenTabs((prev) =>
      prev.map((tab) =>
        tab.key === key ? { ...tab, status: status } : tab
      )
    );
  };


  // Expose `open(id)` to the context
  useEffect(() => {
    tabApi.open = (type, id, name) => {
      const key = `${type}:${id}`;
    
      setOpenTabs((prev) => {
        const exists = prev.find((t) => t.key === key);
        if (exists) return prev;
        return [...prev, { key, type, id, name, status: {} }];
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
      style={{ flex: 1, display: 'flex', flexDirection: "column", minHeight: 0, height: "100%" }}
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <Tabs.List >
        {openTabs.map((tab) => (
          <Tabs.Trigger key={tab.key} value={tab.key} className="tab-trigger">
            <Flex align="center" gap="1" style={{ position: 'relative' }}>
              <Text>{tab.name}</Text>

              <Box style={{ position: 'relative', width: '1em', height: '1em', marginLeft: 4 }}>
                {tab.status?.dirty && (
                  <Box
                    className="dirty-indicator"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    *
                  </Box>
                )}
              
                <Box
                  className="close-button"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.key);
                  }}
                >
                  <Button variant="ghost" size="1">
                    <Cross1Icon />
                  </Button>
                </Box>
              </Box>

            </Flex>
          </Tabs.Trigger>


        ))}

      </Tabs.List>
      <Box style={{ flex: 1, overflow: 'hidden', minHeight: 0, minWidth: 0 }}>

      {openTabs.map((tab) => {
        let content;

        const ref = (tabRefs.current[tab.key] ||= React.createRef());
      
        if (tab.type === 'file') {
          content = <FileView id={tab.id} ref={ref} statusChange={statusChange}/>;
        } else if (tab.type === 'terminal') {
          content = <TerminalView id={tab.id} ref={ref}/>;
        } else {
          content = <div>Unknown tab type</div>;
        }

        const style = {
          flexDirection: 'column',
          minHeight: 0,
          minWidth: 0,
          height: '100%',
          overflow: 'hidden',
        };

        if (tab.key == activeTab){
          style.display = "flex";
        }
      
      
        return (
          <Tabs.Content 
            className="tab-content"
            key={tab.key} 
            value={tab.key} 
            style={style}
            forceMount
          >
            {content}
          </Tabs.Content>
        );
      })}
      </Box>
      
	</Tabs.Root>

    
	

    
  );
};


/*
    <Tabs.Root
      style={{ flex: 1, display: 'flex', flexDirection: "column", minHeight: 0, height: "100%" }}
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <Tabs.List color="indigo">
        {openTabs.map((tab) => (
          <Tabs.Trigger
            key={tab.key}
            value={tab.key}
          >
              {tab.name}
              {tab.status?.dirty && ' *'}
          </Tabs.Trigger>
        ))}

      </Tabs.List>
      <Box pt="3">

{openTabs.map((tab) => {
        let content;

        const ref = (tabRefs.current[tab.key] ||= React.createRef());
      
        /*if (tab.type === 'file') {
          content = <FileView id={tab.id} ref={ref} statusChange={statusChange}/>;
        } else if (tab.type === 'terminal') {
          content = <TerminalView id={tab.id} ref={ref}/>;
        } else {
          content = <div>Unknown tab type</div>;
        }* /
  content = <div>Unknown tab type</div>;

        const style = {
          flexDirection: 'column',
          minHeight: 0,
          minWidth: 0,
          height: '100%',
          overflow: 'hidden',
        };

        if (tab.key == activeTab){
          //style.display = "flex";
        }
      
      
        return (
          <Tabs.Content 
            key={tab.key} 
            value={tab.key} 
            style={style}
          >
            {content}
          </Tabs.Content>
        );
      })}
      </Box>
      
	</Tabs.Root>
*/


export default TabManager;
