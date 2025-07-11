import React, { useState, useEffect } from 'react';
import { Save, DollarSign, Globe, Calendar, Palette, Download, Trash2, AlertTriangle, Mail, Key } from 'lucide-react';
import { storageUtils } from '../../utils/storage';
import { updateEmailConfiguration, validateEmailConfiguration } from '../../utils/emailService';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    currency: 'USD',
    taxRate: 0,
    language: 'en',
    dateFormat: 'MM/dd/yyyy',
    defaultTemplate: 'modern',
    defaultNotes: '',
  });

  const [emailSettings, setEmailSettings] = useState({
    serviceId: '',
    templateId: '',
    publicKey: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const savedSettings = storageUtils.getSettings();
    setSettings(prev => ({ ...prev, ...savedSettings }));

    // Load email settings if they exist
    const savedEmailSettings = localStorage.getItem('email_settings');
    if (savedEmailSettings) {
      setEmailSettings(JSON.parse(savedEmailSettings));
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    storageUtils.saveSettings(settings);
    
    // Save email settings
    localStorage.setItem('email_settings', JSON.stringify(emailSettings));
    updateEmailConfiguration(emailSettings);
    
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 500);
  };

  const handleExportData = () => {
    setIsExporting(true);
    
    try {
      const receipts = storageUtils.getReceipts();
      const profiles = storageUtils.getBusinessProfiles();
      const currentProfile = storageUtils.getCurrentProfile();
      
      const exportData = {
        receipts,
        businessProfiles: profiles,
        currentProfile,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receiptpro-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAllData = () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all data? This action cannot be undone. All receipts, business profiles, and settings will be permanently deleted.'
    );
    
    if (confirmed) {
      const doubleConfirmed = window.confirm(
        'This is your final warning. Are you absolutely sure you want to delete ALL data?'
      );
      
      if (doubleConfirmed) {
        localStorage.clear();
        alert('All data has been cleared successfully. The page will now reload.');
        window.location.reload();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Enhanced Header */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-600">
                  Customize your receipt preferences and application defaults
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>

          {/* Email Configuration */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-blue-600" />
              Email Configuration (EmailJS)
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Key className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Setup Instructions</p>
                    <p>To enable email functionality, you need to create a free EmailJS account and configure your service. Visit <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="underline">emailjs.com</a> to get started.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service ID
                  </label>
                  <input
                    type="text"
                    value={emailSettings.serviceId}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, serviceId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your_service_id"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template ID
                  </label>
                  <input
                    type="text"
                    value={emailSettings.templateId}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, templateId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your_template_id"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Public Key
                  </label>
                  <input
                    type="text"
                    value={emailSettings.publicKey}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, publicKey: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your_public_key"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${validateEmailConfiguration() ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={validateEmailConfiguration() ? 'text-green-700' : 'text-red-700'}>
                  {validateEmailConfiguration() ? 'Email configuration is complete' : 'Email configuration is incomplete'}
                </span>
              </div>
            </div>
          </div>

          {/* Currency & Financial */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
              Currency & Financial Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                  <option value="JPY">JPY - Japanese Yen (¥)</option>
                  <option value="CAD">CAD - Canadian Dollar (C$)</option>
                  <option value="AUD">AUD - Australian Dollar (A$)</option>
                  <option value="CHF">CHF - Swiss Franc (CHF)</option>
                  <option value="CNY">CNY - Chinese Yuan (¥)</option>
                  <option value="INR">INR - Indian Rupee (₹)</option>
                  <option value="KES">KES - Kenyan Shilling (KSh)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  step="0.01"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Localization */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Globe className="h-5 w-5 mr-2 text-blue-600" />
              Localization Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                  <option value="ru">Russian</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date Format
                </label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => setSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MM/dd/yyyy">MM/dd/yyyy (US Format)</option>
                  <option value="dd/MM/yyyy">dd/MM/yyyy (UK Format)</option>
                  <option value="yyyy-MM-dd">yyyy-MM-dd (ISO Format)</option>
                  <option value="dd.MM.yyyy">dd.MM.yyyy (German Format)</option>
                  <option value="dd/MM/yy">dd/MM/yy (Short Format)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Receipt Defaults */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Palette className="h-5 w-5 mr-2 text-blue-600" />
              Receipt Defaults
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Template
                </label>
                <select
                  value={settings.defaultTemplate}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultTemplate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="modern">Modern - Clean gradient design</option>
                  <option value="classic">Classic - Traditional formal style</option>
                  <option value="minimal">Minimal - Simple and clean</option>
                  <option value="professional">Professional - Corporate style</option>
                  <option value="corporate">Corporate - Formal business template</option>
                  <option value="elegant">Elegant - Sophisticated design</option>
                  <option value="creative">Creative - Modern colorful design</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Notes
                </label>
                <textarea
                  value={settings.defaultNotes}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultNotes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Thank you for your purchase! We appreciate your business."
                />
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Data Management
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Download className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Export Data</h4>
                    <p className="text-sm text-gray-500">Download all your receipts, business profiles, and settings</p>
                  </div>
                </div>
                <button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="px-4 py-2 border border-blue-300 rounded-lg shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 transition-colors"
                >
                  {isExporting ? 'Exporting...' : 'Export'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Clear All Data</h4>
                    <p className="text-sm text-gray-500">Permanently remove all receipts, profiles, and settings</p>
                  </div>
                </div>
                <button
                  onClick={handleClearAllData}
                  className="px-4 py-2 border border-red-300 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4 inline mr-1" />
                  Clear Data
                </button>
              </div>
            </div>
          </div>

          {/* Application Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Application Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <p><strong>Version:</strong> 2.0.0</p>
                <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p><strong>Storage:</strong> Local Browser Storage</p>
                <p><strong>Data Persistence:</strong> Enabled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;