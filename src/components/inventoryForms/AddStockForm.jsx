import { useState, useContext } from 'react';
import { InventoryContext } from '../context/InventoryContext';

const AddStockForm = ({ productId }) => {
  const [formData, setFormData] = useState({
    product_id: productId,
    received: 0,
    spoilt: 0
  });
  const { addStock, loading } = useContext(InventoryContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addStock(formData);
      // Reset form or show success message
      setFormData(prev => ({ ...prev, received: 0, spoilt: 0 }));
    } catch (error) {
      // Error handling is done in the context
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Quantity Received
        </label>
        <input
          type="number"
          value={formData.received}
          onChange={(e) => setFormData({...formData, received: parseInt(e.target.value) || 0})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          min="0"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Spoilt/Damaged Quantity
        </label>
        <input
          type="number"
          value={formData.spoilt}
          onChange={(e) => setFormData({...formData, spoilt: parseInt(e.target.value) || 0})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          min="0"
          max={formData.received}
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
      >
        {loading ? 'Adding...' : 'Add Stock'}
      </button>
    </form>
  );
};

export default AddStockForm;