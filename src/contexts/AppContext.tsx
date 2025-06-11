// src/contexts/AppContext.tsx
'use client';
import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

interface AppContextType {
  // Define any app-wide state or functions here
  // For now, let's keep it simple
  appName: string;
  setAppName: (name: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [appName, setAppName] = useState('Career Compass');

  // You can add more state and functions to be shared across the app here

  return (
    <AppContext.Provider value={{ appName, setAppName }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
