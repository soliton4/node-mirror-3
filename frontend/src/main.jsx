import React from 'react';
import ReactDOM from 'react-dom/client';
import { GlobalProvider } from './GlobalContext';
import App from './App';
import { WebSocketProvider } from './WebSocketProvider';
import './global.css';
import "@radix-ui/themes/styles.css";
import "@radix-ui/themes/tokens.css";
import "@radix-ui/themes/components.css";
import "@radix-ui/themes/utilities.css";
import { Theme, ThemePanel } from "@radix-ui/themes";
import '@radix-ui/colors/amber.css';
import '@radix-ui/colors/blue.css';
import '@radix-ui/colors/bronze.css';
import '@radix-ui/colors/brown.css';
import '@radix-ui/colors/crimson.css';
import '@radix-ui/colors/cyan.css';
import '@radix-ui/colors/gold.css';
import '@radix-ui/colors/grass.css';
import '@radix-ui/colors/gray.css';
import '@radix-ui/colors/green.css';
import '@radix-ui/colors/indigo.css';
import '@radix-ui/colors/lime.css';
import '@radix-ui/colors/mauve.css';
import '@radix-ui/colors/mint.css';
import '@radix-ui/colors/olive.css';
import '@radix-ui/colors/orange.css';
import '@radix-ui/colors/pink.css';
import '@radix-ui/colors/plum.css';
import '@radix-ui/colors/purple.css';
import '@radix-ui/colors/red.css';
import '@radix-ui/colors/sage.css';
import '@radix-ui/colors/sand.css';
import '@radix-ui/colors/sky.css';
import '@radix-ui/colors/slate.css';
import '@radix-ui/colors/teal.css';
import '@radix-ui/colors/tomato.css';
import '@radix-ui/colors/violet.css';
import '@radix-ui/colors/yellow.css';
import { ConfigProvider, useConfig } from './ConfigContext';


const ThemedApp = () => {
  const { config } = useConfig(); 

  return (
    <Theme
      appearance={config.appearance}
      panelBackground="solid"
      radius="large"
      accentColor="indigo"
      style={{ flex: 1, display: 'flex', minHeight: 0, minWidth: 0 }}
    >
      <App />
      
    </Theme>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider>
      <GlobalProvider>
        <WebSocketProvider>
          <ThemedApp />
        </WebSocketProvider>
      </GlobalProvider>
    </ConfigProvider>
  </React.StrictMode>
);
