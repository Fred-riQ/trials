import React, { useContext, useEffect, useState } from 'react';
import { AuthContext, InventoryContext } from '../context';
import { 
  FiPackage, 
  FiCheck, 
  FiX, 
  FiClock, 
  FiPlus, 
  FiSearch,
  FiFilter,
  FiDownload
} from 'react-icons/fi';
import Button from '../components/Button';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import '../styles/global.css';

const SupplyRequests = () => {
  const { user } = useContext(AuthContext);
  const { 
    supplyRequests, 
    loading, 
    error,
    fetchSupplyRequests,
    createSupplyRequest,
    approveSupplyRequest,
    rejectSupplyRequest
  } = useContext(InventoryContext);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    product_id: '',
    product_name: '',
    quantity: '',
    urgency: 'normal',
    notes: ''
  });

  // Fetch requests on component mount
  useEffect(() => {
    fetchSupplyRequests();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      await createSupplyRequest(formData);
      fetchSupplyRequests();
      setIsModalOpen(false);
      setFormData({
        product_id: '',
        product_name: '',
        quantity: '',
        urgency: 'normal',
        notes: ''
      });
    } catch (err) {
      console.error('Failed to submit request:', err);
    }
  };

  const handleApprove = async (requestId) => {
    if (window.confirm('Are you sure you want to approve this request?')) {
      await approveSupplyRequest(requestId);
      fetchSupplyRequests();
    }
  };

  const handleReject = async (requestId) => {
    if (window.confirm('Are you sure you want to reject this request?')) {
      await rejectSupplyRequest(requestId);
      fetchSupplyRequests();
    }
  };

  const filteredRequests = supplyRequests.filter(request => {
    const matchesSearch = request.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!user) return null;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Supply Requests</h1>
          <p className="text-gray-600">
            {user.role === 'CLERK' ? 'Request new inventory items' : 'Review and manage inventory requests'}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          {user.role === 'CLERK' && (
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              icon={<FiPlus className="mr-2" />}
            >
              New Request
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <div className="flex items-center">
            <FiAlertCircle className="text-red-500 mr-3" />
            <p className="text-red-700">{error.message || 'Failed to load requests'}</p>
          </div>
        </div>
      )}

      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="relative w-full md:w-64 mb-4 md:mb-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <FiFilter className="text-gray-400 mr-2" />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'fulfilled', label: 'Fulfilled' }
                ]}
                className="w-full md:w-48"
              />
            </div>
            <Button
              variant="outline"
              icon={<FiDownload className="mr-2" />}
            >
              Export
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            icon={<FiPackage className="text-gray-400" size={48} />}
            title="No requests found"
            description={searchTerm || statusFilter !== 'all' 
              ? "Try adjusting your search or filters" 
              : "No supply requests have been made yet"}
            action={
              user.role === 'CLERK' && (
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                  Create New Request
                </Button>
              )
            }
          />
        ) : (
          <Table
            columns={[
              { 
                header: 'Product', 
                accessor: 'product',
                render: (request) => (
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <FiPackage className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{request.product_name}</p>
                      <p className="text-sm text-gray-500">
                        {request.urgency === 'high' ? 'High Priority' : 
                         request.urgency === 'low' ? 'Low Priority' : 'Normal Priority'}
                      </p>
                    </div>
                  </div>
                )
              },
              { 
                header: 'Details', 
                accessor: 'details',
                render: (request) => (
                  <div>
                    <p className="text-sm font-medium">Quantity: {request.quantity}</p>
                    {request.notes && (
                      <p className="text-sm text-gray-500 mt-1">{request.notes}</p>
                    )}
                  </div>
                )
              },
              { 
                header: 'Requested By', 
                accessor: 'requester',
                render: (request) => (
                  <div>
                    <p className="text-sm font-medium">{request.requested_by}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )
              },
              { 
                header: 'Status', 
                accessor: 'status',
                render: (request) => (
                  <StatusBadge 
                    status={request.status}
                    variant={
                      request.status === 'approved' ? 'success' :
                      request.status === 'rejected' ? 'danger' :
                      request.status === 'fulfilled' ? 'info' : 'warning'
                    }
                  />
                )
              },
              {
                header: 'Actions',
                accessor: 'actions',
                render: (request) => (
                  <div className="flex space-x-2">
                    {user.role === 'ADMIN' && request.status === 'pending' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          icon={<FiCheck size={14} />}
                          aria-label="Approve request"
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(request.id)}
                          icon={<FiX size={14} />}
                          aria-label="Reject request"
                        />
                      </>
                    )}
                    {request.status === 'approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => console.log('Mark as fulfilled')}
                      >
                        Mark Fulfilled
                      </Button>
                    )}
                  </div>
                )
              }
            ]}
            data={filteredRequests}
          />
        )}
      </Card>

      {/* New Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Supply Request"
      >
        <form onSubmit={handleSubmitRequest}>
          <div className="space-y-4">
            <Input
              label="Product Name"
              name="product_name"
              value={formData.product_name}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Quantity"
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              min="1"
            />
            <Select
              label="Urgency"
              name="urgency"
              value={formData.urgency}
              onChange={handleInputChange}
              options={[
                { value: 'low', label: 'Low Priority' },
                { value: 'normal', label: 'Normal Priority' },
                { value: 'high', label: 'High Priority' }
              ]}
            />
            <Input
              label="Notes (Optional)"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              as="textarea"
              rows={3}
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
            >
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SupplyRequests;