// frontend/src/App.jsx

import React, { useContext, useEffect, useState, useRef } from 'react';

import { WebSocketContext } from './WebSocketProvider';
import PasswordPrompt from './PasswordPrompt';
import Navigation from './components/Navigation';
import TabManager from './components/TabManager';
import { TabContext } from './components/TabContext';
import { useGlobal } from './GlobalContext';
import { Tabs, Flex } from '@radix-ui/themes';

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';
import { useThemeContext } from '@radix-ui/themes';


const App = () => {
  const tabApi = useRef({ open: () => {} });


  /* ---------- Global config ---------- */
  const { state, updateConfig } = useGlobal();
  
  const { appearance } = useThemeContext();


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


      <PanelGroup direction="horizontal" style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Panel defaultSize={10}>
          <Navigation />
         </Panel>
         <PanelResizeHandle />
         <Panel minSize={10}>
           <TabManager />
         </Panel>
      </PanelGroup>
      
    </TabContext.Provider>
  );
};



export default App;




