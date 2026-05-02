import React, { createContext, useContext, ReactNode } from 'react';

interface PaymentContextType {
  isLoading: boolean;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentContextProvider({ children }: { children: ReactNode }) {
  return (
    <PaymentContext.Provider value={{ isLoading: false }}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentContextProvider');
  }
  return context;
}

