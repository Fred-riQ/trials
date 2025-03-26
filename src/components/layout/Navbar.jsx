import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="h-16 bg-white shadow-md"></div>; // Empty navbar while loading
  }

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center space-x-6">
        <NavLink 
          to="/" 
          className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          MyDuka
        </NavLink>
        
        {/* Role-specific navigation links */}
        {user.role === 'admin' && (
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => 
              `px-3 py-1 rounded-md ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`
            }
          >
            Dashboard
          </NavLink>
        )}
        {/* Add more role-specific links as needed */}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <span className="text-gray-700 font-medium">
            {user.username || user.email.split('@')[0]}
          </span>
          <span 
            className="text-gray-600 text-xs font-semibold bg-gray-100 px-2 py-1 rounded-full capitalize"
            title={`User role: ${user.role}`}
          >
            {user.role}
          </span>
        </div>
        
        <Button
          onClick={handleLogout}
          variant="danger"
          size="sm"
          aria-label="Logout"
          className="hover:scale-105 transition-transform"
        >
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;