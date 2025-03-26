import { createContext, useState, useEffect, useContext } from 'react';
import { inventoryService } from '../services/inventoryService';
import { AuthContext } from './AuthContext';

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [stock, setStock] = useState([]);
  const [supplyRequests, setSupplyRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchSupplyRequests = async () => {
    if (!user || !user.roles.includes('Admin')) return;
    
    try {
      setLoading(true);
      const requests = await inventoryService.getSupplyRequests();
      setSupplyRequests(requests);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const addStock = async (stockData) => {
    try {
      setLoading(true);
      const newStock = await inventoryService.addStock(stockData);
      setStock(prev => [...prev, newStock]);
      return newStock;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId) => {
    try {
      setLoading(true);
      await inventoryService.approveRequest(requestId);
      await fetchSupplyRequests();
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const declineRequest = async (requestId) => {
    try {
      setLoading(true);
      await inventoryService.declineRequest(requestId);
      await fetchSupplyRequests();
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSupplyRequests();
    }
  }, [user]);

  return (
    <InventoryContext.Provider value={{
      stock,
      supplyRequests,
      loading,
      error,
      addStock,
      approveRequest,
      declineRequest,
      refreshRequests: fetchSupplyRequests
    }}>
      {children}
    </InventoryContext.Provider>
  );
};