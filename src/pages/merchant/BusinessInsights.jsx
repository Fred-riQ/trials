import React, { Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { FiTrendingUp, FiDollarSign, FiShoppingCart, FiPackage } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorBoundary from '../../components/ErrorBoundary';

// Lazy load heavy components
const SalesChart = React.lazy(() => import('../../components/charts/LineGraph'));
const InventoryStatus = React.lazy(() => import('../../components/charts/BarGraph'));
const RecentTransactions = React.lazy(() => import('../../components/charts/TransactionsTable'));

const BusinessInsights = () => {
  const { user } = useAuth();
  const { data: insights, loading, error } = useFetch(`/api/merchant/${user?.id}/insights`);

  // Metrics data
  const metrics = [
    {
      title: "Today's Sales",
      value: `Ksh ${insights?.todaySales?.toLocaleString() || '0'}`,
      change: insights?.salesChange || 0,
      icon: <FiTrendingUp className="text-green-500" size={24} />
    },
    {
      title: "Total Revenue",
      value: `Ksh ${insights?.totalRevenue?.toLocaleString() || '0'}`,
      icon: <FiDollarSign className="text-blue-500" size={24} />
    },
    {
      title: "Orders",
      value: insights?.totalOrders?.toLocaleString() || '0',
      change: insights?.orderChange || 0,
      icon: <FiShoppingCart className="text-purple-500" size={24} />
    },
    {
      title: "Inventory Items",
      value: insights?.inventoryCount?.toLocaleString() || '0',
      icon: <FiPackage className="text-orange-500" size={24} />
    }
  ];

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="p-4 text-red-500">Error loading insights</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Business Insights</h1>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">{metric.title}</p>
                <p className="text-2xl font-semibold mt-1">{metric.value}</p>
                {metric.change !== undefined && (
                  <p className={`text-sm mt-1 ${
                    metric.change >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {metric.change >= 0 ? '↑' : '↓'} {Math.abs(metric.change)}% from yesterday
                  </p>
                )}
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                {metric.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBoundary fallback={<Card className="p-4">Failed to load sales data</Card>}>
          <Suspense fallback={<Card className="p-4"><LoadingSpinner /></Card>}>
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
              <div className="h-64">
                <SalesChart 
                  data={insights?.salesData || []} 
                  xField="date" 
                  yField="amount"
                />
              </div>
            </Card>
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary fallback={<Card className="p-4">Failed to load inventory data</Card>}>
          <Suspense fallback={<Card className="p-4"><LoadingSpinner /></Card>}>
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Inventory Status</h2>
              <div className="h-64">
                <InventoryStatus 
                  data={insights?.inventoryData || []}
                  xField="product"
                  yField="quantity"
                />
              </div>
            </Card>
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Recent Transactions */}
      <ErrorBoundary fallback={<Card className="p-4">Failed to load transactions</Card>}>
        <Suspense fallback={<Card className="p-4"><LoadingSpinner /></Card>}>
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
            <RecentTransactions 
              data={insights?.recentTransactions || []}
              pageSize={5}
            />
          </Card>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default BusinessInsights;