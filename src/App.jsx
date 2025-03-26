import { BrowserRouter } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import AppRoutes from './routes/routes';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { Toaster } from 'react-hot-toast';
import './styles/global.css';

function App() {
  // Add global error handler
  useEffect(() => {
    const handleGlobalError = (error) => {
      console.error('Global error caught:', error);
      // You can add error reporting here (e.g., Sentry, LogRocket)
    };

    window.addEventListener('error', handleGlobalError);
    return () => window.removeEventListener('error', handleGlobalError);
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary 
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <h1>Something went wrong</h1>
          </div>
        }
      >
        <AuthProvider>
          <InventoryProvider>
            {/* Suspense for code-split components */}
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <AppLayout>
                <AppRoutes />
              </AppLayout>
              {/* Global toast notifications */}
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10B981',
                      secondary: 'white',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: 'white',
                    },
                  },
                }}
              />
            </Suspense>
          </InventoryProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;