import React from 'react';
import ReactDOM from 'react-dom/client';
import { GlobalProvider } from './GlobalContext';
import App from './App';
import { WebSocketProvider } from './WebSocketProvider';
import './global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalProvider>
      <WebSocketProvider>
        <App />
      </WebSocketProvider>
    </GlobalProvider>
  </React.StrictMode>
);
