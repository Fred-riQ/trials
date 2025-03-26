import React from 'react';
import { NavLink, useLocation, matchPath } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiHome, FiUser, FiPackage, FiShoppingBag, 
  FiUsers, FiFileText, FiArchive, FiPieChart,
  FiSettings, FiLogOut, FiChevronDown, FiChevronRight
} from 'react-icons/fi';
import classNames from 'classnames';

const Sidebar = () => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = React.useState({});
  const [collapsed, setCollapsed] = React.useState(false);

  // Toggle menu expansion
  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  // Icon mapping with consistent sizing
  const iconComponents = {
    dashboard: <FiHome size={18} />,
    profile: <FiUser size={18} />,
    stock: <FiPackage size={18} />,
    requests: <FiFileText size={18} />,
    users: <FiUsers size={18} />,
    stores: <FiShoppingBag size={18} />,
    reports: <FiPieChart size={18} />,
    settings: <FiSettings size={18} />,
    default: <FiArchive size={18} />
  };

  // Navigation configuration
  const navConfig = {
    common: [
      { 
        path: '/', 
        label: 'Dashboard', 
        icon: 'dashboard',
        exact: true
      },
      { 
        path: '/profile', 
        label: 'Profile', 
        icon: 'profile'
      }
    ],
    clerk: [
      {
        label: 'Inventory',
        icon: 'stock',
        submenu: [
          { path: '/stock', label: 'Stock Management' },
          { path: '/requests', label: 'My Requests' }
        ]
      }
    ],
    admin: [
      { 
        path: '/users', 
        label: 'User Management', 
        icon: 'users'
      },
      {
        label: 'Requests',
        icon: 'requests',
        submenu: [
          { path: '/all-requests', label: 'All Requests' },
          { path: '/pending-approvals', label: 'Pending Approvals' }
        ]
      },
      { 
        path: '/reports', 
        label: 'Reports', 
        icon: 'reports'
      }
    ],
    merchant: [
      { 
        path: '/stores', 
        label: 'My Stores', 
        icon: 'stores'
      },
      {
        label: 'Analytics',
        icon: 'reports',
        submenu: [
          { path: '/sales-reports', label: 'Sales Reports' },
          { path: '/inventory-reports', label: 'Inventory Reports' }
        ]
      }
    ]
  };

  const getIcon = (iconName) => iconComponents[iconName] || iconComponents.default;

  // Check if path is active (including submenu items)
  const isActive = (path, exact = false) => {
    return matchPath({ path, exact }, location.pathname);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  if (loading) return (
    <div className={classNames(
      "bg-gray-800 text-white h-full flex-shrink-0 transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}></div>
  );

  if (!user) return null;

  return (
    <div className={classNames(
      "bg-gray-800 text-white h-full flex flex-col fixed left-0 top-0 bottom-0 z-40 transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Brand/Header with collapse button */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!collapsed && (
          <h2 className="text-xl font-bold flex items-center">
            <FiShoppingBag className="mr-2" size={20} />
            MyDuka
          </h2>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-700"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FiChevronRight size={20} /> : <FiChevronDown size={20} />}
        </button>
      </div>

      {/* User profile */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
            {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-medium truncate">{user.username || user.email}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {/* Common links */}
          {navConfig.common.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  classNames(
                    "flex items-center px-3 py-3 rounded-md transition-colors",
                    {
                      'bg-blue-700 text-white': isActive,
                      'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive,
                      'justify-center': collapsed
                    }
                  )
                }
                aria-current={isActive(item.path, item.exact) ? "page" : undefined}
              >
                <span className={classNames(
                  "flex items-center",
                  { 'mr-3': !collapsed }
                )}>
                  {getIcon(item.icon)}
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </span>
              </NavLink>
            </li>
          ))}

          {/* Role-specific links */}
          {(navConfig[user.role] || []).map((item, index) => {
            if (item.path) {
              // Simple link without submenu
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      classNames(
                        "flex items-center px-3 py-3 rounded-md transition-colors",
                        {
                          'bg-blue-700 text-white': isActive,
                          'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive,
                          'justify-center': collapsed
                        }
                      )
                    }
                  >
                    <span className={classNames(
                      "flex items-center",
                      { 'mr-3': !collapsed }
                    )}>
                      {getIcon(item.icon)}
                      {!collapsed && <span className="ml-3">{item.label}</span>}
                    </span>
                  </NavLink>
                </li>
              );
            } else if (item.submenu && !collapsed) {
              // Expandable menu
              const isMenuExpanded = expandedMenus[`menu-${index}`];
              const hasActiveChild = item.submenu.some(subItem => 
                isActive(subItem.path)
              );

              return (
                <li key={`menu-${index}`}>
                  <button
                    onClick={() => toggleMenu(`menu-${index}`)}
                    className={classNames(
                      "w-full flex items-center justify-between px-3 py-3 rounded-md transition-colors",
                      {
                        'text-white bg-gray-700': hasActiveChild,
                        'text-gray-300 hover:bg-gray-700 hover:text-white': !hasActiveChild
                      }
                    )}
                  >
                    <span className="flex items-center">
                      {getIcon(item.icon)}
                      <span className="ml-3">{item.label}</span>
                    </span>
                    {isMenuExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                  </button>

                  {isMenuExpanded && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.path}>
                          <NavLink
                            to={subItem.path}
                            className={({ isActive }) =>
                              classNames(
                                "block px-3 py-2 rounded-md text-sm transition-colors",
                                {
                                  'bg-blue-700 text-white': isActive,
                                  'text-gray-400 hover:bg-gray-700 hover:text-white': !isActive
                                }
                              )
                            }
                          >
                            {subItem.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }
            return null;
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className={classNames(
            "w-full flex items-center px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors",
            { 'justify-center': collapsed }
          )}
          aria-label="Logout"
        >
          <FiLogOut size={18} />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
        {!collapsed && (
          <div className="text-xs text-gray-400 mt-2">
            v{process.env.REACT_APP_VERSION || '1.0.0'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;