// WebSocketProvider.jsx
import React, { createContext, useEffect, useState, useRef } from 'react';

import connectionManager from '../../shared/ConnectionManager.js';
import factory from '../../shared/Factory.js';
factory.init(connectionManager, "client");

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [status, setStatus] = useState('disconnected');
  const [needsAuth, setNeedsAuth] = useState(false);

  const wsRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket(`ws://${window.location.host}`);

    socket.onopen = () => {
      setStatus('connected');
    };

    socket.onclose = () => {
      setStatus('disconnected');
      setAuthenticated(false);
      setNeedsAuth(false);
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log('Received WS message:', msg);

      switch (msg.type) {
        case 'auth_success':
          connectionManager.add(socket);
          setAuthenticated(true);
          setNeedsAuth(false);
          break;
        case 'auth_failed':
        case 'need_auth':
          setNeedsAuth(true);
          break;
        default:
      }
    };

    wsRef.current = socket;
    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  const send = (msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('Sending WS message:', msg);
      wsRef.current.send(JSON.stringify(msg));
    } else {
      console.warn('WebSocket not open');
    }
  };

  return (
    <WebSocketContext.Provider value={{ ws, send, authenticated, status, needsAuth }}>
      {children}
    </WebSocketContext.Provider>
  );
};




