// src/ConfigContext.jsx
import React, { createContext, useContext, useState, useMemo } from 'react';

const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({ appearance: 'dark' });

  const updateConfig = (updates) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const value = useMemo(() => ({ config, updateConfig }), [config]);

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within a ConfigProvider");
  return ctx;
};
