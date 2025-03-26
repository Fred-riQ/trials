import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiUser, FiPackage, FiShoppingBag, FiUsers, FiFileText, FiArchive, FiPieChart } from 'react-icons/fi';

const Sidebar = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="w-64 bg-gray-800 h-full"></div>; // Loading state
  if (!user) return null;

  // Icon mapping for consistent icon usage
  const iconComponents = {
    dashboard: <FiHome className="mr-3" size={18} />,
    profile: <FiUser className="mr-3" size={18} />,
    stock: <FiPackage className="mr-3" size={18} />,
    requests: <FiFileText className="mr-3" size={18} />,
    users: <FiUsers className="mr-3" size={18} />,
    stores: <FiShoppingBag className="mr-3" size={18} />,
    reports: <FiPieChart className="mr-3" size={18} />,
    default: <FiArchive className="mr-3" size={18} />
  };

  // Common links for all roles
  const commonLinks = [
    { to: '/', text: 'Dashboard', icon: 'dashboard' },
    { to: '/profile', text: 'Profile', icon: 'profile' }
  ];

  // Role-specific links
  const roleLinks = {
    clerk: [
      { to: '/stock', text: 'Stock Management', icon: 'stock' },
      { to: '/requests', text: 'My Requests', icon: 'requests' }
    ],
    admin: [
      { to: '/users', text: 'User Management', icon: 'users' },
      { to: '/all-requests', text: 'All Requests', icon: 'requests' },
      { to: '/reports', text: 'Reports', icon: 'reports' }
    ],
    merchant: [
      { to: '/stores', text: 'My Stores', icon: 'stores' },
      { to: '/reports', text: 'Reports', icon: 'reports' }
    ]
  };

  // Get icon component
  const getIcon = (iconName) => iconComponents[iconName] || iconComponents.default;

  return (
    <div className="w-64 bg-gray-800 text-white h-full flex flex-col fixed left-0 top-0 bottom-0 z-40">
      {/* Brand/Header section */}
      <div className="p-5 border-b border-gray-700">
        <h2 className="text-xl font-bold flex items-center">
          <FiShoppingBag className="mr-2" size={20} />
          MyDuka
        </h2>
      </div>

      {/* User info section */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
            {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium truncate">{user.username || user.email}</p>
            <p className="text-xs text-gray-400 capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {[...commonLinks, ...(roleLinks[user.role] || [])].map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-blue-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
                aria-current={location.pathname === link.to ? 'page' : undefined}
              >
                {getIcon(link.icon)}
                {link.text}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer section */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        v{process.env.REACT_APP_VERSION || '1.0.0'}
      </div>
    </div>
  );
};

export default Sidebar;