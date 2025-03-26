// src/context/UserContext.jsx
import { createContext, useContext, useState } from 'react';

// 1. Create the context
const UserContext = createContext();

// 2. Create and export the provider (THIS IS WHAT'S MISSING)
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const value = {
    user,
    setUser,
    // Add other user-related functions as needed
    login: (userData) => setUser(userData),
    logout: () => setUser(null)
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// 3. Export the hook (optional but recommended)
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};