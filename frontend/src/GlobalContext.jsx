// frontend/src/context/GlobalContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';

const GlobalContext = createContext();

const defaultState = {
  config: {
    darkMode: false,
    fontSize: 14,
  },
  user: null,
};

export function GlobalProvider({ children }) {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('globalState');
    return saved ? JSON.parse(saved) : defaultState;
  });

  useEffect(() => {
    localStorage.setItem('globalState', JSON.stringify(state));
  }, [state]);

  const updateConfig = (updates) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates }
    }));
  };

  return (
    <GlobalContext.Provider value={{ state, updateConfig }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  return useContext(GlobalContext);
}
