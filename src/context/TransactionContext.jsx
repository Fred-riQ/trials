// src/context/TransactionContext.jsx
import { createContext, useContext, useState } from 'react';

const TransactionContext = createContext();

// Make sure this export exists
export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  
  const value = {
    transactions,
    setTransactions,
    // add other transaction-related functions here
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

// This export should also exist if you're using it
export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};