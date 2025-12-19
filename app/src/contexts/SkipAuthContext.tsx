import React, { createContext, useContext } from 'react';

interface SkipAuthContextType {
  skipAuth: () => void;
}

export const SkipAuthContext = createContext<SkipAuthContextType | null>(null);

export const useSkipAuth = () => useContext(SkipAuthContext);

interface SkipAuthProviderProps {
  children: React.ReactNode;
  onSkipAuth: () => void;
}

export const SkipAuthProvider: React.FC<SkipAuthProviderProps> = ({ children, onSkipAuth }) => {
  return (
    <SkipAuthContext.Provider value={{ skipAuth: onSkipAuth }}>
      {children}
    </SkipAuthContext.Provider>
  );
};




