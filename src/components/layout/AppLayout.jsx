import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorBoundary from '../ErrorBoundary';
import '../../styles/global.css';

const AppLayout = ({ children }) => {
  const { user, isLoading, error } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-6">
          {error.message || 'Failed to load user data. Please try again later.'}
        </p>
      </div>
    );
  }

  return (
    <div className="app-container bg-gray-50 min-h-screen flex flex-col">
      {user && <Navbar user={user} />}
      
      <div className="flex flex-1 overflow-hidden">
        {user && <Sidebar role={user.role} className="hidden md:block" />}
        
        <main className="main-content flex-1 overflow-y-auto p-4 md:p-6 bg-white">
          <ErrorBoundary 
            fallback={
              <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                Component Error - Please refresh
              </div>
            }
          >
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;