import { useState, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';
import AddStockForm from '../../components/forms/AddStockForm';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const Inventory = () => {
  const { inventory, loading, error, fetchInventory } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddStock = async (stockData) => {
    // Implement API call to add stock
    console.log('Adding stock:', stockData);
    setIsModalOpen(false);
    fetchInventory();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Inventory Management</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          Add New Stock
        </Button>
      </div>

      {loading && <p>Loading inventory...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table implementation similar to SupplyRequestList */}
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Stock">
        <AddStockForm onSubmit={handleAddStock} />
      </Modal>
    </div>
  );
};

export default Inventory;