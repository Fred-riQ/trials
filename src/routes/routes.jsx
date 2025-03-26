import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';

// Enhanced lazy loading with error boundaries
const lazyLoad = (path) => lazy(() => import(`../pages/${path}`).catch(() => ({ 
  default: () => <div>Failed to load component</div> 
})));

// Lazy load pages with explicit .jsx extensions
const Login = lazyLoad('auth/Login.jsx');
const Register = lazyLoad('auth/Register.jsx');
const Inventory = lazyLoad('clerk/Inventory.jsx');
const Transactions = lazyLoad('clerk/Transactions.jsx');
const SupplyRequests = lazyLoad('clerk/SupplyRequests.jsx');
const ManageAdmins = lazyLoad('admin/ManageAdmins.jsx');
const ManageClerks = lazyLoad('admin/ManageClerks.jsx');
const StockApproval = lazyLoad('admin/StockApproval.jsx');
const Reports = lazyLoad('admin/Reports.jsx');
const BusinessInsights = lazyLoad('merchant/BusinessInsights.jsx');
const StoreManagement = lazyLoad('merchant/StoreManagement.jsx');
const StoreReports = lazyLoad('merchant/StoreReports.jsx');
const ProductReports = lazyLoad('merchant/ProductReports.jsx');
const NotFound = lazyLoad('shared/NotFound.jsx');

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  
  return children;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />

        {/* Clerk Routes */}
        <Route path="/inventory" element={
          <ProtectedRoute allowedRoles={['CLERK']}>
            <Inventory />
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute allowedRoles={['CLERK']}>
            <Transactions />
          </ProtectedRoute>
        } />
        <Route path="/supply-requests" element={
          <ProtectedRoute allowedRoles={['CLERK']}>
            <SupplyRequests />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Routes>
              <Route path="manage-admins" element={<ManageAdmins />} />
              <Route path="manage-clerks" element={<ManageClerks />} />
              <Route path="stock-approval" element={<StockApproval />} />
              <Route path="reports" element={<Reports />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* Merchant Routes */}
        <Route path="/merchant/*" element={
          <ProtectedRoute allowedRoles={['MERCHANT']}>
            <Routes>
              <Route path="business-insights" element={<BusinessInsights />} />
              <Route path="store-management" element={<StoreManagement />} />
              <Route path="store-reports" element={<StoreReports />} />
              <Route path="product-reports" element={<ProductReports />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* Root Redirect */}
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['CLERK', 'ADMIN', 'MERCHANT']}>
            {({ user }) => (
              <Navigate to={
                user.role === 'CLERK' ? '/inventory' :
                user.role === 'ADMIN' ? '/admin/stock-approval' :
                '/merchant/business-insights'
              } replace />
            )}
          </ProtectedRoute>
        } />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;