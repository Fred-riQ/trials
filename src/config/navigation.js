export const roleConfig = {
    admin: [
      { path: '/admin/manage-admins', label: 'Manage Admins', icon: 'users' },
      { path: '/admin/manage-clerks', label: 'Manage Clerks', icon: 'users' },
      { path: '/admin/stock-approval', label: 'Stock Approval', icon: 'package' },
      { path: '/admin/reports', label: 'Reports', icon: 'pie-chart' }
    ],
    clerk: [
      { path: '/inventory', label: 'Inventory', icon: 'package' },
      { path: '/transactions', label: 'Transactions', icon: 'dollar-sign' },
      { path: '/supply-requests', label: 'Supply Requests', icon: 'file-text' }
    ],
    merchant: [
      { path: '/business-insights', label: 'Business Insights', icon: 'home' },
      { path: '/store-management', label: 'Store Management', icon: 'shopping-bag' },
      { path: '/store-reports', label: 'Store Reports', icon: 'pie-chart' },
      { path: '/product-reports', label: 'Product Reports', icon: 'bar-chart' }
    ]
  };
  
  export const publicNavItems = [
    { path: '/login', label: 'Login' },
    { path: '/register', label: 'Register' }
  ];