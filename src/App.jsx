import { BrowserRouter } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { UserProvider } from './context/UserContext';
import { TransactionProvider } from './context/TransactionContext';
import AppRoutes from './routes/routes';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { Toaster } from 'react-hot-toast';
import './styles/global.css';

// Toast configuration constants
const TOAST_CONFIG = {
  position: 'top-center',
  duration: 4000,
  style: {
    background: '#363636',
    color: '#fff',
    fontSize: '14px',
    borderRadius: '8px',
    padding: '12px 16px',
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: '#10B981',
      secondary: 'white',
    },
  },
  error: {
    duration: 5000,
    iconTheme: {
      primary: '#EF4444',
      secondary: 'white',
    },
  },
};

function App() {
  // Global error handler
  useEffect(() => {
    const handleGlobalError = (error, isPromiseRejection = false) => {
      console.error('Global error caught:', error);
      // Add error reporting (Sentry, LogRocket, etc.) here
      
      // Example: Show toast for unhandled errors
      if (!isPromiseRejection && process.env.NODE_ENV === 'production') {
        // You could show a toast here if desired
      }
    };

    window.addEventListener('error', (event) => handleGlobalError(event.error));
    window.addEventListener('unhandledrejection', (event) => 
      handleGlobalError(event.reason, true)
    );

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleGlobalError);
    };
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary 
        fallback={
          <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We've encountered an unexpected error. Please try refreshing the page.
            </p>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        }
      >
        <AuthProvider>
          <UserProvider>
            <InventoryProvider>
              <TransactionProvider>
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <AppLayout>
                    <AppRoutes />
                  </AppLayout>
                  
                  {/* Global toast notifications */}
                  <Toaster {...TOAST_CONFIG} />
                </Suspense>
              </TransactionProvider>
            </InventoryProvider>
          </UserProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;