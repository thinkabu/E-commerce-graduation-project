import React, { createContext, useContext, ReactNode } from 'react';

interface AddressContextType {
  isLoading: boolean;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressContextProvider({ children }: { children: ReactNode }) {
  return (
    <AddressContext.Provider value={{ isLoading: false }}>
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress() {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error('useAddress must be used within a AddressContextProvider');
  }
  return context;
}

