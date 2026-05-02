import React, { createContext, useContext, ReactNode } from 'react';

interface NFTContextType {
  isLoading: boolean;
}

const NFTContext = createContext<NFTContextType | undefined>(undefined);

export function NFTContextProvider({ children }: { children: ReactNode }) {
  return (
    <NFTContext.Provider value={{ isLoading: false }}>
      {children}
    </NFTContext.Provider>
  );
}

export function useNFT() {
  const context = useContext(NFTContext);
  if (context === undefined) {
    throw new Error('useNFT must be used within a NFTContextProvider');
  }
  return context;
}

