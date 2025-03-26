import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAdmins, createAdmin, updateAdmin, deactivateAdmin } from '../services/adminService';
import { FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiUserX, FiUserCheck } from 'react-icons/fi';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Table from '../components/Table';
import Input from '../components/Input';
import '../styles/global.css';

const ManageAdmins = () => {
  const { user } = useContext(AuthContext);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'ADMIN'
  });

  useEffect(() => {
    if (user?.role === 'MERCHANT') {
      fetchAdmins();
    }
  }, [user]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await getAdmins();
      if (response.success) {
        setAdmins(response.data);
      } else {
        setError(response.message || 'Failed to fetch admins');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch admins');
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
      if (currentAdmin) {
        response = await updateAdmin(currentAdmin.id, formData);
      } else {
        // For new admin, merchant needs to send an invitation
        response = await createAdmin(formData);
        if (response.success) {
          // Show success message about invitation sent
          setError({ type: 'success', message: 'Invitation sent successfully to admin email' });
        }
      }
      
      if (response.success) {
        fetchAdmins();
        setIsModalOpen(false);
        setFormData({ name: '', email: '', role: 'ADMIN' });
        setCurrentAdmin(null);
      } else {
        setError({ type: 'error', message: response.message || 'Operation failed' });
      }
    } catch (err) {
      setError({ type: 'error', message: err.message || 'Operation failed' });
    }
  };

  const handleEdit = (admin) => {
    setCurrentAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (admin) => {
    const confirmMessage = admin.is_active 
      ? 'Are you sure you want to deactivate this admin?'
      : 'Are you sure you want to activate this admin?';
    
    if (window.confirm(confirmMessage)) {
      try {
        const response = await deactivateAdmin(admin.id, { is_active: !admin.is_active });
        if (response.success) {
          fetchAdmins();
        } else {
          setError({ type: 'error', message: response.message });
        }
      } catch (err) {
        setError({ type: 'error', message: err.message || 'Failed to update admin status' });
      }
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (user?.role !== 'MERCHANT') {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
        <p className="mt-2 text-gray-600">
          Only merchant accounts can manage admins.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Admin Accounts</h1>
          <p className="text-gray-600">Invite, view, and manage admin accounts</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          icon={<FiUserPlus className="mr-2" />}
        >
          Invite Admin
        </Button>
      </div>

      {error && (
        <div className={`mb-6 p-3 rounded-lg flex items-center ${
          error.type === 'success' 
            ? 'bg-green-50 text-green-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {error.type === 'success' ? (
            <FiUserCheck className="mr-2" />
          ) : (
            <FiAlertCircle className="mr-2" />
          )}
          {error.message}
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Table
        columns={[
          { header: 'Name', accessor: 'name' },
          { header: 'Email', accessor: 'email' },
          { header: 'Role', accessor: 'role' },
          { 
            header: 'Status', 
            accessor: 'status',
            render: (admin) => (
              <span className={`px-2 py-1 text-xs rounded-full ${
                admin.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {admin.is_active ? 'Active' : 'Inactive'}
              </span>
            )
          },
          {
            header: 'Actions',
            accessor: 'actions',
            render: (admin) => (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(admin)}
                  icon={<FiEdit2 size={14} />}
                >
                  Edit
                </Button>
                <Button
                  variant={admin.is_active ? "danger" : "success"}
                  size="sm"
                  onClick={() => handleToggleStatus(admin)}
                  icon={admin.is_active ? <FiUserX size={14} /> : <FiUserCheck size={14} />}
                >
                  {admin.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            )
          }
        ]}
        data={filteredAdmins}
        emptyMessage="No admin accounts found"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentAdmin(null);
          setFormData({ name: '', email: '', role: 'ADMIN' });
        }}
        title={currentAdmin ? 'Edit Admin' : 'Invite New Admin'}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={!!currentAdmin}
            />
            {!currentAdmin && (
              <p className="text-sm text-gray-500">
                An invitation link will be sent to this email address
              </p>
            )}
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
              {currentAdmin ? 'Update Admin' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageAdmins;