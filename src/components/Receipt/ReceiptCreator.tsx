import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Save, Eye, Download, Calendar, DollarSign, Building2, Palette, Mail, CreditCard } from 'lucide-react';
import { Receipt, ReceiptItem, BusinessProfile } from '../../types';
import { storageUtils } from '../../utils/storage';
import { generateReceiptNumber, calculateReceiptTotals } from '../../utils/receiptHelpers';
import { generateReceiptPDF } from '../../utils/pdfGenerator';
import ReceiptTemplate from './ReceiptTemplates';
import EmailModal from './EmailModal';

const ReceiptCreator: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<BusinessProfile | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [receipt, setReceipt] = useState<Partial<Receipt>>({
    receiptNumber: generateReceiptNumber(),
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    items: [],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    total: 0,
    notes: '',
    paymentMethod: 'cash',
    transactionDate: new Date(),
    status: 'completed',
    template: 'modern',
    currency: 'USD',
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const templateOptions = [
    { id: 'modern', name: 'Modern', description: 'Clean gradient design with professional layout' },
    { id: 'classic', name: 'Classic', description: 'Traditional formal receipt with elegant borders' },
    { id: 'minimal', name: 'Minimal', description: 'Simple and clean design with subtle typography' },
    { id: 'professional', name: 'Professional', description: 'Corporate style with structured layout' },
    { id: 'corporate', name: 'Corporate', description: 'Formal business template with dark accents' },
    { id: 'elegant', name: 'Elegant', description: 'Sophisticated design with refined typography' },
    { id: 'creative', name: 'Creative', description: 'Modern colorful design with gradient elements' },
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
    { value: 'mobile_money', label: 'Mobile Money', icon: '📱' },
    { value: 'check', label: 'Check', icon: '📝' },
    { value: 'other', label: 'Other', icon: '💰' },
  ];

  useEffect(() => {
    const loadData = () => {
      const profiles = storageUtils.getBusinessProfiles();
      const currentProfile = storageUtils.getCurrentProfile();
      
      setBusinessProfiles(profiles);
      
      if (isEditing && id) {
        const savedReceipt = storageUtils.getReceiptById(id);
        if (savedReceipt) {
          setReceipt(savedReceipt);
          setSelectedProfile(savedReceipt.businessProfile);
        }
      } else if (currentProfile) {
        setSelectedProfile(currentProfile);
      } else if (profiles.length > 0) {
        setSelectedProfile(profiles[0]);
      }

      // Load default settings
      const settings = storageUtils.getSettings();
      setReceipt(prev => ({
        ...prev,
        currency: settings.currency || 'USD',
        taxRate: settings.taxRate || 0,
        template: settings.defaultTemplate || 'modern',
        notes: settings.defaultNotes || '',
      }));
    };

    loadData();
  }, [isEditing, id]);

  const addItem = () => {
    const newItem: ReceiptItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      price: 0,
      amount: 0,
    };
    setReceipt(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem],
    }));
  };

  const updateItem = (itemId: string, field: keyof ReceiptItem, value: string | number) => {
    setReceipt(prev => ({
      ...prev,
      items: (prev.items || []).map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'price') {
            updatedItem.amount = updatedItem.quantity * updatedItem.price;
          }
          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const removeItem = (itemId: string) => {
    setReceipt(prev => ({
      ...prev,
      items: (prev.items || []).filter(item => item.id !== itemId),
    }));
  };

  const calculateTotals = () => {
    const items = receipt.items || [];
    const totals = calculateReceiptTotals(items, receipt.taxRate || 0, receipt.discountRate || 0);
    setReceipt(prev => ({ ...prev, ...totals }));
  };

  useEffect(() => {
    calculateTotals();
  }, [receipt.items, receipt.taxRate, receipt.discountRate]);

  const handleSave = async () => {
    if (!selectedProfile) {
      alert('Please select a business profile');
      return;
    }

    if (!receipt.customerName || !receipt.customerEmail) {
      alert('Please fill in customer information');
      return;
    }

    if (!receipt.items || receipt.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    setIsSaving(true);

    try {
      const receiptData: Receipt = {
        id: receipt.id || Date.now().toString(),
        receiptNumber: receipt.receiptNumber!,
        businessProfile: selectedProfile,
        customerName: receipt.customerName!,
        customerEmail: receipt.customerEmail!,
        customerPhone: receipt.customerPhone || '',
        customerAddress: receipt.customerAddress || '',
        items: receipt.items!,
        subtotal: receipt.subtotal!,
        taxRate: receipt.taxRate!,
        taxAmount: receipt.taxAmount!,
        discountRate: receipt.discountRate!,
        discountAmount: receipt.discountAmount!,
        total: receipt.total!,
        notes: receipt.notes || '',
        paymentMethod: receipt.paymentMethod!,
        transactionDate: receipt.transactionDate!,
        status: receipt.status!,
        template: receipt.template!,
        currency: receipt.currency!,
        createdAt: receipt.createdAt || new Date(),
        updatedAt: new Date(),
      };

      storageUtils.saveReceipt(receiptData);
      alert('Receipt saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving receipt:', error);
      alert('Error saving receipt. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedProfile) {
      alert('Please select a business profile');
      return;
    }

    try {
      const receiptData: Receipt = {
        id: receipt.id || Date.now().toString(),
        receiptNumber: receipt.receiptNumber!,
        businessProfile: selectedProfile,
        customerName: receipt.customerName!,
        customerEmail: receipt.customerEmail!,
        customerPhone: receipt.customerPhone || '',
        customerAddress: receipt.customerAddress || '',
        items: receipt.items!,
        subtotal: receipt.subtotal!,
        taxRate: receipt.taxRate!,
        taxAmount: receipt.taxAmount!,
        discountRate: receipt.discountRate!,
        discountAmount: receipt.discountAmount!,
        total: receipt.total!,
        notes: receipt.notes || '',
        paymentMethod: receipt.paymentMethod!,
        transactionDate: receipt.transactionDate!,
        status: receipt.status!,
        template: receipt.template!,
        currency: receipt.currency!,
        createdAt: receipt.createdAt || new Date(),
        updatedAt: new Date(),
      };

      await generateReceiptPDF(receiptData, 'receipt-preview');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleSendEmail = () => {
    if (!selectedProfile) {
      alert('Please select a business profile');
      return;
    }

    if (!receipt.customerEmail) {
      alert('Please enter customer email address');
      return;
    }

    setShowEmailModal(true);
  };

  const getCompleteReceipt = (): Receipt => {
    return {
      id: receipt.id || Date.now().toString(),
      receiptNumber: receipt.receiptNumber!,
      businessProfile: selectedProfile!,
      customerName: receipt.customerName!,
      customerEmail: receipt.customerEmail!,
      customerPhone: receipt.customerPhone || '',
      customerAddress: receipt.customerAddress || '',
      items: receipt.items!,
      subtotal: receipt.subtotal!,
      taxRate: receipt.taxRate!,
      taxAmount: receipt.taxAmount!,
      discountRate: receipt.discountRate!,
      discountAmount: receipt.discountAmount!,
      total: receipt.total!,
      notes: receipt.notes || '',
      paymentMethod: receipt.paymentMethod!,
      transactionDate: receipt.transactionDate!,
      status: receipt.status!,
      template: receipt.template!,
      currency: receipt.currency!,
      createdAt: receipt.createdAt || new Date(),
      updatedAt: new Date(),
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Enhanced Header */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isEditing ? 'Edit Receipt' : 'Create New Receipt'}
                </h1>
                <p className="text-gray-600">
                  {isEditing ? 'Update your receipt details' : 'Fill in the details to create your professional receipt'}
                </p>
              </div>
              <div className="mt-6 lg:mt-0 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Hide Preview' : 'Preview'}
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={!receipt.customerEmail || !selectedProfile}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={!receipt.customerName || !receipt.items?.length}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Receipt'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="space-y-6">
              {/* Business Profile Selection */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Business Profile
                </h3>
                {businessProfiles.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">No business profiles found</p>
                    <button
                      onClick={() => navigate('/profile')}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Create Business Profile
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <select
                      value={selectedProfile?.id || ''}
                      onChange={(e) => {
                        const profile = businessProfiles.find(p => p.id === e.target.value);
                        setSelectedProfile(profile || null);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a business profile</option>
                      {businessProfiles.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.name} - {profile.email}
                        </option>
                      ))}
                    </select>
                    
                    {selectedProfile && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {selectedProfile.logo && (
                            <img
                              src={selectedProfile.logo}
                              alt="Business Logo"
                              className="h-12 w-12 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{selectedProfile.name}</p>
                            <p className="text-sm text-gray-600">{selectedProfile.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Receipt Details */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Receipt Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Receipt Number
                    </label>
                    <input
                      type="text"
                      value={receipt.receiptNumber || ''}
                      onChange={(e) => setReceipt(prev => ({ ...prev, receiptNumber: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Palette className="inline h-4 w-4 mr-1" />
                      Template
                    </label>
                    <select
                      value={receipt.template || 'modern'}
                      onChange={(e) => setReceipt(prev => ({ ...prev, template: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {templateOptions.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Transaction Date
                    </label>
                    <input
                      type="date"
                      value={receipt.transactionDate ? receipt.transactionDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setReceipt(prev => ({ ...prev, transactionDate: new Date(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CreditCard className="inline h-4 w-4 mr-1" />
                      Payment Method
                    </label>
                    <select
                      value={receipt.paymentMethod || 'cash'}
                      onChange={(e) => setReceipt(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {paymentMethods.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.icon} {method.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="inline h-4 w-4 mr-1" />
                      Currency
                    </label>
                    <select
                      value={receipt.currency || 'USD'}
                      onChange={(e) => setReceipt(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="KES">KES - Kenyan Shilling</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={receipt.status || 'completed'}
                      onChange={(e) => setReceipt(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="completed">Completed</option>
                      <option value="refunded">Refunded</option>
                      <option value="partial_refund">Partial Refund</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Template Preview Cards */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Template Style</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templateOptions.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setReceipt(prev => ({ ...prev, template: template.id as any }))}
                      className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                        receipt.template === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={receipt.customerName || ''}
                      onChange={(e) => setReceipt(prev => ({ ...prev, customerName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={receipt.customerEmail || ''}
                      onChange={(e) => setReceipt(prev => ({ ...prev, customerEmail: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={receipt.customerPhone || ''}
                      onChange={(e) => setReceipt(prev => ({ ...prev, customerPhone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={receipt.customerAddress || ''}
                      onChange={(e) => setReceipt(prev => ({ ...prev, customerAddress: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Items</h3>
                  <button
                    onClick={addItem}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {receipt.items?.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="md:col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price
                        </label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount
                        </label>
                        <input
                          type="number"
                          value={item.amount}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-100"
                        />
                      </div>

                      <div className="md:col-span-1 flex items-end">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculations */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      value={receipt.taxRate || 0}
                      onChange={(e) => setReceipt(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Rate (%)
                    </label>
                    <input
                      type="number"
                      value={receipt.discountRate || 0}
                      onChange={(e) => setReceipt(prev => ({ ...prev, discountRate: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">{receipt.currency} {receipt.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  {(receipt.discountAmount || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-red-600">-{receipt.currency} {receipt.discountAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                  )}
                  {(receipt.taxAmount || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium text-gray-900">{receipt.currency} {receipt.taxAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-blue-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-lg font-bold text-blue-600">{receipt.currency} {receipt.total?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={receipt.notes || ''}
                    onChange={(e) => setReceipt(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Thank you for your purchase!"
                  />
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {showPreview && (
              <div className="xl:sticky xl:top-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div id="receipt-preview" className="transform scale-50 origin-top-left w-[200%] h-[200%] overflow-hidden">
                      {selectedProfile && receipt.customerName && receipt.items?.length ? (
                        <ReceiptTemplate
                          receipt={getCompleteReceipt()}
                          templateId={receipt.template || 'modern'}
                        />
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <p>Fill in the form to see preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && selectedProfile && receipt.customerEmail && (
        <EmailModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          receipt={getCompleteReceipt()}
        />
      )}
    </div>
  );
};

export default ReceiptCreator;