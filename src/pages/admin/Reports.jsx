import React, { useContext, useEffect, useState } from 'react';
import { AuthContext, InventoryContext } from '../context';
import { FiDownload, FiRefreshCw, FiCalendar, FiBarChart2, FiTrendingUp, FiBox } from 'react-icons/fi';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Button from '../components/Button';
import Card from '../components/Card';
import Dropdown from '../components/Dropdown';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import '../styles/global.css';

// Register Chart.js components
Chart.register(...registerables);

const Reports = () => {
  const { user } = useContext(AuthContext);
  const { reports, loading, fetchReports, error } = useContext(InventoryContext);
  const [reportType, setReportType] = useState('inventory');
  const [timeRange, setTimeRange] = useState('monthly');
  const [storeFilter, setStoreFilter] = useState('all');
  const [customRange, setCustomRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  });

  useEffect(() => {
    if (user?.store_id) {
      fetchReports(timeRange, reportType, storeFilter);
    }
  }, [timeRange, reportType, storeFilter]);

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setCustomRange({ start, end });
    if (start && end) {
      fetchReports('custom', reportType, storeFilter, { start, end });
    }
  };

  const handleExport = (format) => {
    // Export logic here
    console.log(`Exporting ${reportType} report as ${format}`);
  };

  const renderChart = () => {
    if (!reports || !reports.data) return null;

    const commonOptions = {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `${reportType === 'inventory' ? 'Inventory' : 'Supply'} Report (${timeRange})`
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return reportType === 'inventory' 
                ? `${context.dataset.label}: ${context.raw} units`
                : `$${context.raw.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return reportType === 'inventory' ? value : `$${value}`;
            }
          }
        }
      }
    };

    switch (reportType) {
      case 'inventory':
        return (
          <Bar
            data={{
              labels: reports.labels,
              datasets: [
                {
                  label: 'Current Stock',
                  data: reports.data.current,
                  backgroundColor: 'rgba(54, 162, 235, 0.6)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1
                },
                {
                  label: 'Spoiled/Damaged',
                  data: reports.data.spoiled,
                  backgroundColor: 'rgba(255, 99, 132, 0.6)',
                  borderColor: 'rgba(255, 99, 132, 1)',
                  borderWidth: 1
                }
              ]
            }}
            options={commonOptions}
          />
        );
      case 'supply':
        return (
          <Line
            data={{
              labels: reports.labels,
              datasets: [
                {
                  label: 'Supply Requests',
                  data: reports.data.requests,
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 2,
                  tension: 0.1,
                  fill: true
                },
                {
                  label: 'Approved Requests',
                  data: reports.data.approved,
                  backgroundColor: 'rgba(153, 102, 255, 0.2)',
                  borderColor: 'rgba(153, 102, 255, 1)',
                  borderWidth: 2,
                  tension: 0.1
                }
              ]
            }}
            options={commonOptions}
          />
        );
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Reports</h1>
          <p className="text-gray-600">Analyze stock levels and supply requests</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button
            variant="secondary"
            onClick={() => fetchReports(timeRange, reportType, storeFilter)}
            icon={<FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />}
            disabled={loading}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <div className="flex space-x-2">
                <Button
                  variant={reportType === 'inventory' ? 'primary' : 'outline'}
                  onClick={() => setReportType('inventory')}
                  icon={<FiBox className="mr-2" />}
                  size="sm"
                >
                  Inventory
                </Button>
                <Button
                  variant={reportType === 'supply' ? 'primary' : 'outline'}
                  onClick={() => setReportType('supply')}
                  icon={<FiTrendingUp className="mr-2" />}
                  size="sm"
                >
                  Supply
                </Button>
              </div>
            </div>

            {user.role === 'MERCHANT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Filter</label>
                <select
                  value={storeFilter}
                  onChange={(e) => setStoreFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Stores</option>
                  <option value="store1">Nairobi Branch</option>
                  <option value="store2">Mombasa Branch</option>
                  <option value="store3">Kisumu Branch</option>
                </select>
              </div>
            )}

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
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error.message || 'Failed to load reports'}</p>
                  </div>
                </div>
              </div>
            ) : reports && reports.data ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      {reportType === 'inventory' ? 'Total Items in Stock' : 'Total Requests'}
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {reportType === 'inventory' 
                        ? reports.summary.totalStock.toLocaleString() 
                        : reports.summary.totalRequests.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      {reportType === 'inventory' ? 'Items Requiring Restock' : 'Approval Rate'}
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {reportType === 'inventory' 
                        ? reports.summary.lowStock.toLocaleString() 
                        : `${reports.summary.approvalRate}%`}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-purple-800">
                      {reportType === 'inventory' ? 'Spoiled/Damaged Items' : 'Pending Requests'}
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {reportType === 'inventory' 
                        ? reports.summary.spoiled.toLocaleString() 
                        : reports.summary.pendingRequests.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="h-96 mb-6">
                  {renderChart()}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {reportType === 'inventory' ? 'Product' : 'Request Date'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {reportType === 'inventory' ? 'Category' : 'Requested By'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {reportType === 'inventory' ? 'In Stock' : 'Quantity'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {reportType === 'inventory' ? 'Status' : 'Status'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reports.details.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {reportType === 'inventory' ? item.product : new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {reportType === 'inventory' ? item.category : item.requested_by}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {reportType === 'inventory' ? item.quantity : item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.status === 'approved' || item.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                              item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <EmptyState
                icon={<FiBarChart2 className="mx-auto h-12 w-12 text-gray-400" />}
                title="No report data available"
                description="Select a time range and report type to generate data"
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;