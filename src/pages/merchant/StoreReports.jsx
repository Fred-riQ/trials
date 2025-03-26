import React, { useContext, useEffect, useState } from 'react';
import { AuthContext, InventoryContext } from '../context';
import { FiDollarSign, FiPackage, FiTrendingUp, FiTrendingDown, FiBarChart2 } from 'react-icons/fi';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Button from '../components/Button';
import Card from '../components/Card';
import Dropdown from '../components/Dropdown';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import '../styles/global.css';

// Register Chart.js components
Chart.register(...registerables);

const StoreReports = () => {
  const { user } = useContext(AuthContext);
  const { fetchStoreReports, reportsLoading, reportsError, storeReports } = useContext(InventoryContext);
  const [timeRange, setTimeRange] = useState('monthly');
  const [selectedStore, setSelectedStore] = useState('all');
  const [customRange, setCustomRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  });
  const [activeTab, setActiveTab] = useState('performance');

  // Mock store data - replace with API call in real implementation
  const stores = [
    { id: 'store1', name: 'Nairobi Main Store' },
    { id: 'store2', name: 'Mombasa Branch' },
    { id: 'store3', name: 'Kisumu Branch' }
  ];

  useEffect(() => {
    if (user?.role === 'MERCHANT') {
      fetchStoreReports(timeRange, selectedStore);
    }
  }, [timeRange, selectedStore]);

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setCustomRange({ start, end });
    if (start && end) {
      fetchStoreReports('custom', selectedStore, { start, end });
    }
  };

  const handleExport = (format) => {
    console.log(`Exporting store report as ${format}`);
    // Actual export implementation would go here
  };

  const renderPerformanceChart = () => {
    if (!storeReports?.performance) return null;

    return (
      <Bar
        data={{
          labels: storeReports.performance.labels,
          datasets: [
            {
              label: 'Revenue',
              data: storeReports.performance.revenue,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
              yAxisID: 'y'
            },
            {
              label: 'Items Sold',
              data: storeReports.performance.itemsSold,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              yAxisID: 'y1'
            }
          ]
        }}
        options={{
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `Store Performance (${timeRange})`
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.datasetIndex === 0 
                    ? `Revenue: $${context.raw.toLocaleString()}`
                    : `Items Sold: ${context.raw.toLocaleString()}`;
                }
              }
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Revenue ($)'
              },
              ticks: {
                callback: function(value) {
                  return `$${value}`;
                }
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Items Sold'
              },
              grid: {
                drawOnChartArea: false
              }
            }
          }
        }}
      />
    );
  };

  const renderInventoryChart = () => {
    if (!storeReports?.inventory) return null;

    return (
      <Line
        data={{
          labels: storeReports.inventory.labels,
          datasets: [
            {
              label: 'Stock Level',
              data: storeReports.inventory.stockLevels,
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 2,
              tension: 0.1,
              fill: true
            },
            {
              label: 'Spoiled Items',
              data: storeReports.inventory.spoiledItems,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
              tension: 0.1
            }
          ]
        }}
        options={{
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `Inventory Trends (${timeRange})`
            }
          }
        }}
      />
    );
  };

  if (user?.role !== 'MERCHANT') {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-center p-6 max-w-md">
          <FiBarChart2 className="mx-auto text-4xl text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-gray-600">
            Only merchant accounts can view store performance reports.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Store Performance Reports</h1>
          <p className="text-gray-600">Analyze individual store performance and inventory trends</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button
            variant="secondary"
            onClick={() => fetchStoreReports(timeRange, selectedStore)}
            icon={<FiRefreshCw className={`mr-2 ${reportsLoading ? 'animate-spin' : ''}`} />}
            disabled={reportsLoading}
          >
            Refresh
          </Button>
          <Dropdown
            options={[
              { label: 'Export as PDF', value: 'pdf' },
              { label: 'Export as CSV', value: 'csv' }
            ]}
            onSelect={handleExport}
            trigger={
              <Button variant="primary" icon={<FiDownload className="mr-2" />}>
                Export
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Store</label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Stores</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={timeRange === 'weekly' ? 'primary' : 'outline'}
                  onClick={() => setTimeRange('weekly')}
                  size="sm"
                >
                  Weekly
                </Button>
                <Button
                  variant={timeRange === 'monthly' ? 'primary' : 'outline'}
                  onClick={() => setTimeRange('monthly')}
                  size="sm"
                >
                  Monthly
                </Button>
                <Button
                  variant={timeRange === 'quarterly' ? 'primary' : 'outline'}
                  onClick={() => setTimeRange('quarterly')}
                  size="sm"
                >
                  Quarterly
                </Button>
                <Button
                  variant={timeRange === 'annual' ? 'primary' : 'outline'}
                  onClick={() => setTimeRange('annual')}
                  size="sm"
                >
                  Annual
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Range</label>
              <DatePicker
                selectsRange
                startDate={customRange.start}
                endDate={customRange.end}
                onChange={handleDateRangeChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholderText="Select date range"
                isClearable
              />
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('performance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'performance' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Performance
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'inventory' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Inventory
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'payments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Payments
              </button>
            </nav>
          </div>

          <div className="p-4">
            {reportsLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : reportsError ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{reportsError.message || 'Failed to load reports'}</p>
                  </div>
                </div>
              </div>
            ) : storeReports ? (
              <>
                {activeTab === 'performance' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <FiDollarSign className="text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">Total Revenue</p>
                            <p className="text-2xl font-bold text-blue-600">
                              ${storeReports.summary.totalRevenue?.toLocaleString() || '0'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <FiTrendingUp className="text-green-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-green-800">Growth Rate</p>
                            <p className="text-2xl font-bold text-green-600">
                              {storeReports.summary.growthRate > 0 ? '+' : ''}{storeReports.summary.growthRate || '0'}%
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <FiPackage className="text-purple-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-purple-800">Items Sold</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {storeReports.summary.itemsSold?.toLocaleString() || '0'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-96 mb-6">
                      {renderPerformanceChart()}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {storeReports.topProducts?.map((product, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.quantitySold}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.revenue.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {product.trend > 0 ? (
                                  <FiTrendingUp className="text-green-500" />
                                ) : (
                                  <FiTrendingDown className="text-red-500" />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {activeTab === 'inventory' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <FiPackage className="text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">Total Inventory</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {storeReports.inventorySummary?.totalItems?.toLocaleString() || '0'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <FiTrendingUp className="text-green-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-green-800">Restock Needed</p>
                            <p className="text-2xl font-bold text-green-600">
                              {storeReports.inventorySummary?.restockNeeded?.toLocaleString() || '0'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <FiAlertCircle className="text-purple-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-purple-800">Spoiled Items</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {storeReports.inventorySummary?.spoiledItems?.toLocaleString() || '0'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-96 mb-6">
                      {renderInventoryChart()}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold (Period)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spoiled</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {storeReports.inventoryItems?.map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.currentStock}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sold}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.spoiled}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge 
                                  status={item.status} 
                                  variant={
                                    item.status === 'in_stock' ? 'success' : 
                                    item.status === 'low_stock' ? 'warning' : 'danger'
                                  } 
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {activeTab === 'payments' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <FiDollarSign className="text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">Paid to Suppliers</p>
                            <p className="text-2xl font-bold text-blue-600">
                              ${storeReports.paymentsSummary?.paidAmount?.toLocaleString() || '0'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <FiAlertCircle className="text-green-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-green-800">Pending Payments</p>
                            <p className="text-2xl font-bold text-green-600">
                              ${storeReports.paymentsSummary?.pendingAmount?.toLocaleString() || '0'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <FiTrendingUp className="text-purple-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-purple-800">Payment Efficiency</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {storeReports.paymentsSummary?.efficiency || '0'}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {storeReports.payments?.map((payment, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.supplier}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.product}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${payment.amount.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(payment.dueDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge 
                                  status={payment.status} 
                                  variant={payment.status === 'paid' ? 'success' : 'danger'} 
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            ) : (
              <EmptyState
                icon={<FiBarChart2 className="mx-auto h-12 w-12 text-gray-400" />}
                title="No report data available"
                description="Select a store and time range to generate reports"
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StoreReports;