import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getClerks, createClerk, updateClerk, toggleClerkStatus } from '../services/clerkService';
import { FiUserPlus, FiEdit2, FiUserX, FiUserCheck, FiSearch, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import Modal from '../components/Modal';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import Input from '../components/Input';
import Select from '../components/Select';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import '../styles/global.css';

const ManageClerks = () => {
  const { user } = useContext(AuthContext);
  const [clerks, setClerks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClerk, setCurrentClerk] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branch: '',
    is_active: true
  });

  // Fetch clerks on component mount
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchClerks();
    }
  }, [user]);

  const fetchClerks = async () => {
    try {
      setLoading(true);
      const response = await getClerks();
      if (response.success) {
        setClerks(response.data);
        setError(null);
      } else {
        setError(response.message || 'Failed to fetch clerks');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch clerks');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (currentClerk) {
        response = await updateClerk(currentClerk.id, formData);
      } else {
        response = await createClerk(formData);
      }

      if (response.success) {
        fetchClerks();
        resetForm();
        setError({ type: 'success', message: currentClerk ? 'Clerk updated successfully' : 'Clerk created successfully' });
      } else {
        setError({ type: 'error', message: response.message || 'Operation failed' });
      }
    } catch (err) {
      setError({ type: 'error', message: err.message || 'Operation failed' });
    }
  };

  const handleEdit = (clerk) => {
    setCurrentClerk(clerk);
    setFormData({
      name: clerk.name,
      email: clerk.email,
      phone: clerk.phone,
      branch: clerk.branch,
      is_active: clerk.is_active
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (clerk) => {
    const confirmMessage = clerk.is_active 
      ? 'Are you sure you want to deactivate this clerk?'
      : 'Are you sure you want to activate this clerk?';
    
    if (window.confirm(confirmMessage)) {
      try {
        const response = await toggleClerkStatus(clerk.id, { is_active: !clerk.is_active });
        if (response.success) {
          fetchClerks();
          setError({ type: 'success', message: clerk.is_active ? 'Clerk deactivated' : 'Clerk activated' });
        } else {
          setError({ type: 'error', message: response.message });
        }
      } catch (err) {
        setError({ type: 'error', message: err.message || 'Failed to update clerk status' });
      }
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setCurrentClerk(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      branch: '',
      is_active: true
    });
  };

  const filteredClerks = clerks.filter(clerk =>
    clerk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clerk.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (clerk.phone && clerk.phone.includes(searchTerm))
  );

  // Access control - Only ADMIN can manage clerks
  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-center p-6 max-w-md">
          <FiUser className="mx-auto text-4xl text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-gray-600">
            Only administrators can manage clerk accounts.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSkeleton rows={5} />;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-800">Manage Data Entry Clerks</h1>
          <p className="text-gray-600">Add and manage clerks who can record inventory data</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search clerks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-64"
            />
          </div>
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            icon={<FiUserPlus className="mr-2" />}
          >
            Add Clerk
          </Button>
        </div>
      </div>

      {error && (
        <div className={`mb-6 p-4 border-l-4 rounded ${
          error.type === 'success' 
            ? 'bg-green-50 border-green-500 text-green-700' 
            : 'bg-red-50 border-red-500 text-red-700'
        }`}>
          <div className="flex items-center">
            {error.type === 'success' ? (
              <FiUserCheck className="mr-3" />
            ) : (
              <FiAlertCircle className="mr-3" />
            )}
            <p>{error.message}</p>
          </div>
        </div>
      )}

      {filteredClerks.length === 0 ? (
        <EmptyState
          icon={<FiUser className="text-gray-400" size={48} />}
          title="No clerks found"
          description={searchTerm ? "No matching clerks found" : "No clerks have been added yet"}
          action={
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Add New Clerk
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={[
            { 
              header: 'Name', 
              accessor: 'name',
              render: (row) => (
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <FiUser className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{row.name}</p>
                    <p className="text-sm text-gray-500">{row.branch || 'Main Branch'}</p>
                  </div>
                </div>
              )
            },
            { 
              header: 'Contact', 
              accessor: 'contact',
              render: (row) => (
                <div>
                  <div className="flex items-center text-sm">
                    <FiMail className="mr-2 text-gray-400" />
                    {row.email}
                  </div>
                  {row.phone && (
                    <div className="flex items-center text-sm mt-1">
                      <FiPhone className="mr-2 text-gray-400" />
                      {row.phone}
                    </div>
                  )}
                </div>
              )
            },
            { 
              header: 'Status', 
              accessor: 'status',
              render: (row) => (
                <StatusBadge 
                  status={row.is_active ? 'active' : 'inactive'} 
                  variant={row.is_active ? 'success' : 'danger'}
                />
              )
            },
            {
              header: 'Actions',
              accessor: 'actions',
              render: (row) => (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(row)}
                    icon={<FiEdit2 size={14} />}
                    aria-label={`Edit ${row.name}`}
                  >
                    Edit
                  </Button>
                  <Button
                    variant={row.is_active ? "danger" : "success"}
                    size="sm"
                    onClick={() => handleToggleStatus(row)}
                    icon={row.is_active ? <FiUserX size={14} /> : <FiUserCheck size={14} />}
                    aria-label={row.is_active ? 'Deactivate clerk' : 'Activate clerk'}
                  >
                    {row.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              )
            }
          ]}
          data={filteredClerks}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={currentClerk ? 'Edit Clerk Details' : 'Add New Clerk'}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              icon={<FiUser className="text-gray-400" />}
            />
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={!!currentClerk}
              icon={<FiMail className="text-gray-400" />}
            />
            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              icon={<FiPhone className="text-gray-400" />}
              placeholder="+254700000000"
            />
            <Input
              label="Branch"
              name="branch"
              value={formData.branch}
              onChange={handleInputChange}
              required
              placeholder="Main Branch"
            />
            {currentClerk && (
              <Select
                label="Account Status"
                name="is_active"
                value={formData.is_active}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  is_active: e.target.value === 'true'
                }))}
                options={[
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Inactive' }
                ]}
              />
            )}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={resetForm}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={loading}
            >
              {currentClerk ? 'Update Clerk' : 'Add Clerk'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageClerks;