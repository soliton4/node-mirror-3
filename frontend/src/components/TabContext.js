// src/components/TabContext.js

import { createContext, useContext } from 'react';

export const TabContext = createContext(null);
export const useTabs = () => useContext(TabContext);
