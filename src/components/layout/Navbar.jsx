import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import ProfileBadge from '../ui/ProfileBadge'; 
import { FiLogOut, FiUser, FiHome, FiSettings } from 'react-icons/fi';
import { roleConfig } from '../../config/navigation';

const Navbar = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) {
    return <div className="h-16 bg-white shadow-md animate-pulse"></div>;
  }

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { state: { from: location.pathname } });
    } catch (error) {
      console.error('Logout failed:', error);
      // Consider adding toast notification here
    }
  };

  // Get role-specific navigation items from config
  const navItems = roleConfig[user.role] || [];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left side - Brand and navigation */}
          <div className="flex items-center space-x-8">
            <NavLink 
              to="/" 
              className="flex items-center text-xl font-semibold text-primary-600 hover:text-primary-800 transition-colors"
              aria-label="Home"
            >
              <FiHome className="mr-2" />
              MyDuka
            </NavLink>

            {/* Dynamic navigation based on role */}
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary-50 text-primary-600' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`
                  }
                  end={item.exact}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right side - User controls */}
          <div className="flex items-center space-x-4">
            <ProfileBadge 
              username={user.username || user.email.split('@')[0]} 
              role={user.role}
              avatar={user.avatar}
            />
            
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              aria-label="Logout"
              className="text-gray-500 hover:text-red-600 group"
              icon={<FiLogOut className="group-hover:scale-110 transition-transform" />}
            />
            
            {/* Settings dropdown would go here */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;