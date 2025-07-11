import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Receipt, DollarSign, Users, TrendingUp, Eye, Edit, Trash2, Search, Filter, Calendar } from 'lucide-react';
import { Receipt as ReceiptType } from '../../types';
import { storageUtils } from '../../utils/storage';
import { formatCurrency, getStatusColor, getStatusIcon, getPaymentMethodIcon } from '../../utils/receiptHelpers';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const [receipts, setReceipts] = useState<ReceiptType[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<ReceiptType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    totalReceipts: 0,
    totalRevenue: 0,
    completedReceipts: 0,
    refundedReceipts: 0,
    partialRefunds: 0,
    cashPayments: 0,
    cardPayments: 0,
  });

  useEffect(() => {
    const loadReceipts = () => {
      const savedReceipts = storageUtils.getReceipts();
      setReceipts(savedReceipts);
      
      // Calculate stats
      const totalReceipts = savedReceipts.length;
      const totalRevenue = savedReceipts
        .filter(receipt => receipt.status === 'completed')
        .reduce((sum, receipt) => sum + receipt.total, 0);
      const completedReceipts = savedReceipts.filter(receipt => receipt.status === 'completed').length;
      const refundedReceipts = savedReceipts.filter(receipt => receipt.status === 'refunded').length;
      const partialRefunds = savedReceipts.filter(receipt => receipt.status === 'partial_refund').length;
      const cashPayments = savedReceipts.filter(receipt => receipt.paymentMethod === 'cash').length;
      const cardPayments = savedReceipts.filter(receipt => receipt.paymentMethod === 'card').length;
      
      setStats({
        totalReceipts,
        totalRevenue,
        completedReceipts,
        refundedReceipts,
        partialRefunds,
        cashPayments,
        cardPayments,
      });
    };

    loadReceipts();
  }, []);

  useEffect(() => {
    let filtered = receipts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(receipt =>
        receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(receipt => receipt.status === statusFilter);
    }

    setFilteredReceipts(filtered);
  }, [receipts, searchTerm, statusFilter]);

  const handleDeleteReceipt = (id: string) => {
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      storageUtils.deleteReceipt(id);
      const updatedReceipts = receipts.filter(receipt => receipt.id !== id);
      setReceipts(updatedReceipts);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-2xl font-bold text-gray-900">{value}</dd>
            {subtitle && <dd className="text-xs text-gray-500">{subtitle}</dd>}
          </dl>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Enhanced Header */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">
                  Welcome back! Here's an overview of your receipt activity
                </p>
              </div>
              <div className="mt-6 lg:mt-0">
                <Link
                  to="/create"
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Receipt
                </Link>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Receipts"
              value={stats.totalReceipts}
              icon={Receipt}
              color="bg-blue-500"
              subtitle="All time"
            />
            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              icon={DollarSign}
              color="bg-green-500"
              subtitle="Completed transactions"
            />
            <StatCard
              title="Completed"
              value={stats.completedReceipts}
              icon={TrendingUp}
              color="bg-emerald-500"
              subtitle={`${stats.totalReceipts > 0 ? Math.round((stats.completedReceipts / stats.totalReceipts) * 100) : 0}% success rate`}
            />
            <StatCard
              title="Customers"
              value={new Set(receipts.map(r => r.customerEmail)).size}
              icon={Users}
              color="bg-purple-500"
              subtitle="Unique customers"
            />
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Refunded"
              value={stats.refundedReceipts}
              icon={Calendar}
              color="bg-red-500"
              subtitle="Full refunds"
            />
            <StatCard
              title="Cash Payments"
              value={stats.cashPayments}
              icon={DollarSign}
              color="bg-yellow-500"
              subtitle="Cash transactions"
            />
            <StatCard
              title="Card Payments"
              value={stats.cardPayments}
              icon={Receipt}
              color="bg-indigo-500"
              subtitle="Card transactions"
            />
          </div>

          {/* Enhanced Receipts Table */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Receipts</h3>
                
                {/* Search and Filter */}
                <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search receipts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="refunded">Refunded</option>
                      <option value="partial_refund">Partial Refund</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {filteredReceipts.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {receipts.length === 0 ? 'No receipts yet' : 'No receipts match your search'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {receipts.length === 0 
                    ? 'Get started by creating your first receipt.' 
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
                {receipts.length === 0 && (
                  <Link
                    to="/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Receipt
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receipt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReceipts.slice(0, 10).map((receipt) => (
                      <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{receipt.receiptNumber}</div>
                          <div className="text-sm text-gray-500 capitalize">{receipt.template} template</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{receipt.customerName}</div>
                          <div className="text-sm text-gray-500">{receipt.customerEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(receipt.total, receipt.currency)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <span className="mr-2">{getPaymentMethodIcon(receipt.paymentMethod)}</span>
                            {receipt.paymentMethod.replace('_', ' ').toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(receipt.status)}`}>
                            <span className="mr-1">{getStatusIcon(receipt.status)}</span>
                            {receipt.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{format(new Date(receipt.transactionDate), 'MMM dd, yyyy')}</div>
                          <div className="text-xs text-gray-400">
                            {format(new Date(receipt.createdAt), 'HH:mm')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {/* View functionality */}}
                              className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded"
                              title="View Receipt"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <Link
                              to={`/edit/${receipt.id}`}
                              className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded"
                              title="Edit Receipt"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteReceipt(receipt.id)}
                              className="text-red-600 hover:text-red-900 transition-colors p-1 rounded"
                              title="Delete Receipt"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;