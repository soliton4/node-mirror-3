// frontend/src/App.jsx

import React, { useContext, useEffect, useState, useRef } from 'react';

import { WebSocketContext } from './WebSocketProvider';
import PasswordPrompt from './PasswordPrompt';
import Navigation from './components/Navigation';
import TabManager from './components/TabManager';
import { TabContext } from './components/TabContext';
import { useGlobal } from './GlobalContext';
import { Tabs, Flex } from '@radix-ui/themes';
import { useConfig } from './ConfigContext';

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';
import { useThemeContext } from '@radix-ui/themes';

// New imports for assistant-ui integration
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useLocalRuntime } from '@assistant-ui/react';
import { Thread } from '@/components/assistant-ui/thread';  // Using @/ alias for src/components/...

// Custom adapter for your backend (define this in a separate file, e.g., src/lib/my-model-adapter.js)
import { MyModelAdapter } from '@/lib/my-model-adapter';

const App = () => {
  const tabApi = useRef({ open: () => {}, getContext: () => {} });

  MyModelAdapter.getContext = () => {
    if (tabApi && tabApi.current){
      
      return tabApi.current.getContext();
    }
  };

  // Move this hook to the top—must be unconditional to avoid hook count mismatches
  const runtime = useLocalRuntime(MyModelAdapter);

  /* ---------- Global config ---------- */
  const { state, updateConfig } = useGlobal();
  
  const { appearance } = useThemeContext();

  /* ---------- WebSocket auth ---------- */
  const { authenticated, status } = useContext(WebSocketContext);

  const { config } = useConfig();

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
  
        {config.aiVisible && <>
          <PanelResizeHandle />
          <Panel defaultSize={25} minSize={20}>
            {/* Wrap Thread in the provider for runtime/state management */}
            <AssistantRuntimeProvider runtime={runtime}>
              <Thread />
            </AssistantRuntimeProvider>
          </Panel>
        </>}
      </PanelGroup>
    </TabContext.Provider>
  );
};

export default App;