import { useInventory } from '../../context/InventoryContext';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';

const SupplyRequestList = ({ isAdmin = false }) => {
  const { requests, loading, error } = useInventory();

  if (loading) return <div>Loading requests...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map(request => (
            <tr key={request.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.product}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.quantity}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={request.status} />
              </td>
              {isAdmin && request.status === 'PENDING' && (
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button size="sm" variant="success">Approve</Button>
                  <Button size="sm" variant="danger">Reject</Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplyRequestList;