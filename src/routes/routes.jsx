import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Lazy load pages
const Login = lazy(() => import('../pages/auth/Login'));
const Inventory = lazy(() => import('../pages/clerk/Inventory'));
const SupplyRequests = lazy(() => import('../pages/clerk/SupplyRequests'));
const ManageClerks = lazy(() => import('../pages/admin/ManageClerks'));
const Reports = lazy(() => import('../pages/admin/Reports'));
const Dashboard = lazy(() => import('../pages/merchant/Dashboard'));
const StoreReports = lazy(() => import('../pages/merchant/StoreReports'));
const NotFound = lazy(() => import('../pages/shared/NotFound'));

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  
  return children;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Clerk Routes */}
        <Route path="/clerk" element={
          <ProtectedRoute roles={['CLERK']}>
            <Inventory />
          </ProtectedRoute>
        } />
        <Route path="/clerk/supplies" element={
          <ProtectedRoute roles={['CLERK']}>
            <SupplyRequests />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/manage-clerks" element={
          <ProtectedRoute roles={['ADMIN']}>
            <ManageClerks />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute roles={['ADMIN']}>
            <Reports />
          </ProtectedRoute>
        } />

        {/* Merchant Routes */}
        <Route path="/merchant/dashboard" element={
          <ProtectedRoute roles={['MERCHANT']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/merchant/store-reports" element={
          <ProtectedRoute roles={['MERCHANT']}>
            <StoreReports />
          </ProtectedRoute>
        } />

        {/* Default Redirect */}
        <Route path="/" element={
          <ProtectedRoute roles={['CLERK', 'ADMIN', 'MERCHANT']}>
            {({ user }) => {
              switch(user?.role) {
                case 'CLERK': return <Navigate to="/clerk" replace />;
                case 'ADMIN': return <Navigate to="/admin/manage-clerks" replace />;
                case 'MERCHANT': return <Navigate to="/merchant/dashboard" replace />;
                default: return <Navigate to="/login" replace />;
              }
            }}
          </ProtectedRoute>
        } />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;