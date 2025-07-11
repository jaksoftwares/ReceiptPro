import React from 'react';
import { Receipt } from '../../types';
import { formatCurrency, getPaymentMethodIcon } from '../../utils/receiptHelpers';
import { format } from 'date-fns';

interface ReceiptTemplateProps {
  receipt: Receipt;
  templateId: string;
}

const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ receipt, templateId }) => {
  const renderTemplate = () => {
    switch (templateId) {
      case 'modern':
        return <ModernTemplate receipt={receipt} />;
      case 'classic':
        return <ClassicTemplate receipt={receipt} />;
      case 'minimal':
        return <MinimalTemplate receipt={receipt} />;
      case 'professional':
        return <ProfessionalTemplate receipt={receipt} />;
      case 'corporate':
        return <CorporateTemplate receipt={receipt} />;
      case 'elegant':
        return <ElegantTemplate receipt={receipt} />;
      case 'creative':
        return <CreativeTemplate receipt={receipt} />;
      default:
        return <ModernTemplate receipt={receipt} />;
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {renderTemplate()}
    </div>
  );
};

// Modern Template
const ModernTemplate: React.FC<{ receipt: Receipt }> = ({ receipt }) => (
  <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          {receipt.businessProfile.logo && (
            <img
              src={receipt.businessProfile.logo}
              alt="Business Logo"
              className="h-16 w-16 object-cover rounded-lg"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{receipt.businessProfile.name}</h1>
            <p className="text-gray-600">{receipt.businessProfile.email}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-blue-600 mb-2">RECEIPT</h2>
          <p className="text-gray-600">#{receipt.receiptNumber}</p>
        </div>
      </div>

      {/* Business & Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">From</h3>
          <div className="text-gray-600 space-y-1">
            <p>{receipt.businessProfile.name}</p>
            <p>{receipt.businessProfile.address}</p>
            <p>{receipt.businessProfile.city}, {receipt.businessProfile.state} {receipt.businessProfile.zipCode}</p>
            <p>{receipt.businessProfile.phone}</p>
            <p>{receipt.businessProfile.email}</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">To</h3>
          <div className="text-gray-600 space-y-1">
            <p>{receipt.customerName}</p>
            <p>{receipt.customerEmail}</p>
            {receipt.customerPhone && <p>{receipt.customerPhone}</p>}
            {receipt.customerAddress && <p>{receipt.customerAddress}</p>}
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Date:</span>
            <p className="text-gray-900">{format(receipt.transactionDate, 'MMMM dd, yyyy')}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Payment Method:</span>
            <p className="text-gray-900 flex items-center">
              <span className="mr-2">{getPaymentMethodIcon(receipt.paymentMethod)}</span>
              {receipt.paymentMethod.replace('_', ' ').toUpperCase()}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <p className="text-green-600 font-medium">{receipt.status.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 font-semibold text-gray-900">Description</th>
              <th className="text-center py-3 font-semibold text-gray-900">Qty</th>
              <th className="text-right py-3 font-semibold text-gray-900">Price</th>
              <th className="text-right py-3 font-semibold text-gray-900">Amount</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3 text-gray-900">{item.description}</td>
                <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                <td className="py-3 text-right text-gray-600">{formatCurrency(item.price, receipt.currency)}</td>
                <td className="py-3 text-right font-medium text-gray-900">{formatCurrency(item.amount, receipt.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="border-t-2 border-gray-200 pt-4">
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(receipt.subtotal, receipt.currency)}</span>
            </div>
            {receipt.discountAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span>-{formatCurrency(receipt.discountAmount, receipt.currency)}</span>
              </div>
            )}
            {receipt.taxAmount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax:</span>
                <span>{formatCurrency(receipt.taxAmount, receipt.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(receipt.total, receipt.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {receipt.notes && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
          <p className="text-gray-600">{receipt.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Thank you for your business!</p>
        {receipt.businessProfile.website && (
          <p className="mt-1">{receipt.businessProfile.website}</p>
        )}
      </div>
    </div>
  </div>
);

// Classic Template
const ClassicTemplate: React.FC<{ receipt: Receipt }> = ({ receipt }) => (
  <div className="p-8 bg-gray-50">
    <div className="max-w-2xl mx-auto bg-white border-2 border-gray-800 p-8">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
        {receipt.businessProfile.logo && (
          <img
            src={receipt.businessProfile.logo}
            alt="Business Logo"
            className="h-20 w-20 object-cover mx-auto mb-4 border-2 border-gray-800"
          />
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{receipt.businessProfile.name}</h1>
        <h2 className="text-2xl font-bold text-gray-800">RECEIPT</h2>
        <p className="text-lg font-semibold mt-2">#{receipt.receiptNumber}</p>
      </div>

      {/* Business Info */}
      <div className="text-center mb-6">
        <div className="text-gray-700 space-y-1">
          <p>{receipt.businessProfile.address}</p>
          <p>{receipt.businessProfile.city}, {receipt.businessProfile.state} {receipt.businessProfile.zipCode}</p>
          <p>Phone: {receipt.businessProfile.phone} | Email: {receipt.businessProfile.email}</p>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="border border-gray-800 p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Customer:</strong> {receipt.customerName}</p>
            <p><strong>Email:</strong> {receipt.customerEmail}</p>
            {receipt.customerPhone && <p><strong>Phone:</strong> {receipt.customerPhone}</p>}
          </div>
          <div>
            <p><strong>Date:</strong> {format(receipt.transactionDate, 'MMMM dd, yyyy')}</p>
            <p><strong>Payment:</strong> {receipt.paymentMethod.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Status:</strong> {receipt.status.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse border-2 border-gray-800 mb-6">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="border border-gray-800 p-3 text-left">Description</th>
            <th className="border border-gray-800 p-3 text-center">Qty</th>
            <th className="border border-gray-800 p-3 text-right">Price</th>
            <th className="border border-gray-800 p-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {receipt.items.map((item, index) => (
            <tr key={index} className="even:bg-gray-50">
              <td className="border border-gray-800 p-3">{item.description}</td>
              <td className="border border-gray-800 p-3 text-center">{item.quantity}</td>
              <td className="border border-gray-800 p-3 text-right">{formatCurrency(item.price, receipt.currency)}</td>
              <td className="border border-gray-800 p-3 text-right font-semibold">{formatCurrency(item.amount, receipt.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="border-2 border-gray-800 p-4">
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">Subtotal:</span>
              <span>{formatCurrency(receipt.subtotal, receipt.currency)}</span>
            </div>
            {receipt.discountAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span className="font-semibold">Discount:</span>
                <span>-{formatCurrency(receipt.discountAmount, receipt.currency)}</span>
              </div>
            )}
            {receipt.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="font-semibold">Tax:</span>
                <span>{formatCurrency(receipt.taxAmount, receipt.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold border-t-2 border-gray-800 pt-2">
              <span>TOTAL:</span>
              <span>{formatCurrency(receipt.total, receipt.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {receipt.notes && (
        <div className="mt-6 border border-gray-800 p-4">
          <h4 className="font-bold text-gray-900 mb-2">NOTES</h4>
          <p className="text-gray-700">{receipt.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-center border-t-2 border-gray-800 pt-4">
        <p className="font-bold text-gray-900">THANK YOU FOR YOUR BUSINESS!</p>
      </div>
    </div>
  </div>
);

// Minimal Template
const MinimalTemplate: React.FC<{ receipt: Receipt }> = ({ receipt }) => (
  <div className="p-8 bg-white">
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          {receipt.businessProfile.logo && (
            <img
              src={receipt.businessProfile.logo}
              alt="Business Logo"
              className="h-12 w-12 object-cover mb-4"
            />
          )}
          <h1 className="text-xl font-light text-gray-900">{receipt.businessProfile.name}</h1>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-light text-gray-900 mb-1">Receipt</h2>
          <p className="text-gray-500">{receipt.receiptNumber}</p>
        </div>
      </div>

      {/* Transaction Info */}
      <div className="mb-8 text-sm text-gray-600">
        <p>Date: {format(receipt.transactionDate, 'MMMM dd, yyyy')}</p>
        <p>Customer: {receipt.customerName}</p>
        <p>Payment: {receipt.paymentMethod.replace('_', ' ')}</p>
      </div>

      {/* Items */}
      <div className="mb-8">
        {receipt.items.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex-1">
              <p className="text-gray-900">{item.description}</p>
              <p className="text-sm text-gray-500">{item.quantity} × {formatCurrency(item.price, receipt.currency)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-900">{formatCurrency(item.amount, receipt.currency)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-end">
          <div className="w-48 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(receipt.subtotal, receipt.currency)}</span>
            </div>
            {receipt.discountAmount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Discount</span>
                <span>-{formatCurrency(receipt.discountAmount, receipt.currency)}</span>
              </div>
            )}
            {receipt.taxAmount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatCurrency(receipt.taxAmount, receipt.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-medium text-gray-900 border-t border-gray-200 pt-2">
              <span>Total</span>
              <span>{formatCurrency(receipt.total, receipt.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {receipt.notes && (
        <div className="mt-8 text-sm text-gray-600">
          <p>{receipt.notes}</p>
        </div>
      )}
    </div>
  </div>
);

// Professional Template
const ProfessionalTemplate: React.FC<{ receipt: Receipt }> = ({ receipt }) => (
  <div className="p-8 bg-gray-100">
    <div className="max-w-2xl mx-auto bg-white shadow-lg">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            {receipt.businessProfile.logo && (
              <img
                src={receipt.businessProfile.logo}
                alt="Business Logo"
                className="h-16 w-16 object-cover rounded-lg bg-white p-1"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{receipt.businessProfile.name}</h1>
              <p className="text-blue-100">{receipt.businessProfile.email}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold">RECEIPT</h2>
            <p className="text-blue-100">#{receipt.receiptNumber}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Business & Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Business Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{receipt.businessProfile.address}</p>
              <p>{receipt.businessProfile.city}, {receipt.businessProfile.state} {receipt.businessProfile.zipCode}</p>
              <p>Phone: {receipt.businessProfile.phone}</p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{receipt.customerName}</p>
              <p>{receipt.customerEmail}</p>
              {receipt.customerPhone && <p>{receipt.customerPhone}</p>}
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Transaction Date</span>
              <p className="text-gray-900">{format(receipt.transactionDate, 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Payment Method</span>
              <p className="text-gray-900">{receipt.paymentMethod.replace('_', ' ').toUpperCase()}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status</span>
              <p className="text-green-600 font-medium">{receipt.status.toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Item</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Qty</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Price</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Total</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">{item.description}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(item.price, receipt.currency)}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">{formatCurrency(item.amount, receipt.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(receipt.subtotal, receipt.currency)}</span>
              </div>
              {receipt.discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(receipt.discountAmount, receipt.currency)}</span>
                </div>
              )}
              {receipt.taxAmount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax:</span>
                  <span>{formatCurrency(receipt.taxAmount, receipt.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-blue-600 border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(receipt.total, receipt.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {receipt.notes && (
          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
            <p className="text-gray-700">{receipt.notes}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-100 p-4 text-center">
        <p className="text-gray-600">Thank you for your business!</p>
        {receipt.businessProfile.website && (
          <p className="text-sm text-gray-500 mt-1">{receipt.businessProfile.website}</p>
        )}
      </div>
    </div>
  </div>
);

// Corporate Template
const CorporateTemplate: React.FC<{ receipt: Receipt }> = ({ receipt }) => (
  <div className="p-8 bg-gray-900">
    <div className="max-w-2xl mx-auto bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white p-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {receipt.businessProfile.logo && (
              <img
                src={receipt.businessProfile.logo}
                alt="Business Logo"
                className="h-20 w-20 object-cover rounded-lg bg-white p-2"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{receipt.businessProfile.name}</h1>
              <p className="text-gray-300">{receipt.businessProfile.email}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold">RECEIPT</h2>
            <p className="text-gray-300 text-lg">#{receipt.receiptNumber}</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Company Details */}
        <div className="border-b-2 border-gray-900 pb-6 mb-6">
          <div className="text-center">
            <div className="text-gray-700 space-y-1">
              <p className="font-medium">{receipt.businessProfile.address}</p>
              <p>{receipt.businessProfile.city}, {receipt.businessProfile.state} {receipt.businessProfile.zipCode}</p>
              <p>Tel: {receipt.businessProfile.phone} | Email: {receipt.businessProfile.email}</p>
              {receipt.businessProfile.taxNumber && <p>Tax ID: {receipt.businessProfile.taxNumber}</p>}
            </div>
          </div>
        </div>

        {/* Transaction Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">CUSTOMER DETAILS</h3>
            <div className="text-gray-700 space-y-1">
              <p className="font-medium">{receipt.customerName}</p>
              <p>{receipt.customerEmail}</p>
              {receipt.customerPhone && <p>{receipt.customerPhone}</p>}
              {receipt.customerAddress && <p>{receipt.customerAddress}</p>}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">TRANSACTION INFO</h3>
            <div className="text-gray-700 space-y-1">
              <p><span className="font-medium">Date:</span> {format(receipt.transactionDate, 'MMMM dd, yyyy')}</p>
              <p><span className="font-medium">Payment:</span> {receipt.paymentMethod.replace('_', ' ').toUpperCase()}</p>
              <p><span className="font-medium">Status:</span> <span className="text-green-600 font-bold">{receipt.status.toUpperCase()}</span></p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="text-left py-4 px-4 font-bold">DESCRIPTION</th>
                <th className="text-center py-4 px-4 font-bold">QTY</th>
                <th className="text-right py-4 px-4 font-bold">UNIT PRICE</th>
                <th className="text-right py-4 px-4 font-bold">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200 even:bg-gray-50">
                  <td className="py-4 px-4 text-gray-900 font-medium">{item.description}</td>
                  <td className="py-4 px-4 text-center text-gray-700">{item.quantity}</td>
                  <td className="py-4 px-4 text-right text-gray-700">{formatCurrency(item.price, receipt.currency)}</td>
                  <td className="py-4 px-4 text-right font-bold text-gray-900">{formatCurrency(item.amount, receipt.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <div className="flex justify-end">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-gray-700">
                <span className="font-medium">SUBTOTAL:</span>
                <span className="font-bold">{formatCurrency(receipt.subtotal, receipt.currency)}</span>
              </div>
              {receipt.discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span className="font-medium">DISCOUNT:</span>
                  <span className="font-bold">-{formatCurrency(receipt.discountAmount, receipt.currency)}</span>
                </div>
              )}
              {receipt.taxAmount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">TAX:</span>
                  <span className="font-bold">{formatCurrency(receipt.taxAmount, receipt.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-bold text-gray-900 border-t-2 border-gray-900 pt-3">
                <span>TOTAL:</span>
                <span>{formatCurrency(receipt.total, receipt.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {receipt.notes && (
          <div className="mt-8 p-4 border-2 border-gray-900 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-2">ADDITIONAL NOTES</h4>
            <p className="text-gray-700">{receipt.notes}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white p-6 text-center">
        <p className="text-xl font-bold">THANK YOU FOR YOUR BUSINESS</p>
        <p className="text-gray-300 mt-2">We appreciate your trust in our services</p>
      </div>
    </div>
  </div>
);

// Elegant Template
const ElegantTemplate: React.FC<{ receipt: Receipt }> = ({ receipt }) => (
  <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50">
    <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8">
        <div className="text-center">
          {receipt.businessProfile.logo && (
            <img
              src={receipt.businessProfile.logo}
              alt="Business Logo"
              className="h-20 w-20 object-cover rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
            />
          )}
          <h1 className="text-3xl font-elegant mb-2">{receipt.businessProfile.name}</h1>
          <p className="text-purple-100">{receipt.businessProfile.email}</p>
          <div className="mt-6">
            <h2 className="text-4xl font-elegant">Receipt</h2>
            <p className="text-purple-100 text-lg">#{receipt.receiptNumber}</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Elegant divider */}
        <div className="flex items-center justify-center mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent flex-1"></div>
          <div className="px-4">
            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent flex-1"></div>
        </div>

        {/* Transaction Details */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-purple-600 font-medium mb-1">Transaction Date</p>
                <p className="text-gray-900 font-semibold">{format(receipt.transactionDate, 'MMMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-purple-600 font-medium mb-1">Payment Method</p>
                <p className="text-gray-900 font-semibold">{receipt.paymentMethod.replace('_', ' ').toUpperCase()}</p>
              </div>
              <div>
                <p className="text-purple-600 font-medium mb-1">Status</p>
                <p className="text-green-600 font-bold">{receipt.status.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="text-center mb-8">
          <h3 className="text-lg font-elegant text-purple-600 mb-3">Valued Customer</h3>
          <div className="text-gray-700">
            <p className="font-semibold text-lg">{receipt.customerName}</p>
            <p>{receipt.customerEmail}</p>
            {receipt.customerPhone && <p>{receipt.customerPhone}</p>}
          </div>
        </div>

        {/* Items */}
        <div className="mb-8">
          <h3 className="text-lg font-elegant text-purple-600 mb-4 text-center">Purchase Details</h3>
          <div className="space-y-3">
            {receipt.items.map((item, index) => (
              <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.description}</p>
                    <p className="text-sm text-purple-600">{item.quantity} × {formatCurrency(item.price, receipt.currency)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(item.amount, receipt.currency)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6">
          <div className="space-y-3">
            <div className="flex justify-between text-purple-100">
              <span>Subtotal</span>
              <span>{formatCurrency(receipt.subtotal, receipt.currency)}</span>
            </div>
            {receipt.discountAmount > 0 && (
              <div className="flex justify-between text-pink-200">
                <span>Discount</span>
                <span>-{formatCurrency(receipt.discountAmount, receipt.currency)}</span>
              </div>
            )}
            {receipt.taxAmount > 0 && (
              <div className="flex justify-between text-purple-100">
                <span>Tax</span>
                <span>{formatCurrency(receipt.taxAmount, receipt.currency)}</span>
              </div>
            )}
            <div className="border-t border-purple-400 pt-3">
              <div className="flex justify-between text-2xl font-bold">
                <span>Total</span>
                <span>{formatCurrency(receipt.total, receipt.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {receipt.notes && (
          <div className="mt-8 text-center">
            <div className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
              <h4 className="font-elegant text-purple-600 mb-2">Special Notes</h4>
              <p className="text-gray-700 italic">{receipt.notes}</p>
            </div>
          </div>
        )}

        {/* Elegant Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent flex-1"></div>
            <div className="px-4">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent flex-1"></div>
          </div>
          <p className="text-purple-600 font-elegant text-lg">Thank you for choosing us</p>
          <p className="text-gray-500 text-sm mt-2">We truly appreciate your business</p>
        </div>
      </div>
    </div>
  </div>
);

// Creative Template
const CreativeTemplate: React.FC<{ receipt: Receipt }> = ({ receipt }) => (
  <div className="p-8 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden transform rotate-1">
      <div className="transform -rotate-1">
        {/* Creative Header */}
        <div className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                {receipt.businessProfile.logo && (
                  <div className="relative">
                    <img
                      src={receipt.businessProfile.logo}
                      alt="Business Logo"
                      className="h-16 w-16 object-cover rounded-2xl border-4 border-white shadow-lg"
                    />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-xs">✨</span>
                    </div>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">{receipt.businessProfile.name}</h1>
                  <p className="text-cyan-100">{receipt.businessProfile.email}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
                  <h2 className="text-3xl font-bold">RECEIPT</h2>
                  <p className="text-cyan-100">#{receipt.receiptNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Creative Transaction Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-2">📅</div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-bold text-gray-900">{format(receipt.transactionDate, 'MMM dd, yyyy')}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-2">{getPaymentMethodIcon(receipt.paymentMethod)}</div>
              <p className="text-sm text-gray-600">Payment</p>
              <p className="font-bold text-gray-900">{receipt.paymentMethod.replace('_', ' ').toUpperCase()}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-2">✅</div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-bold text-green-600">{receipt.status.toUpperCase()}</p>
            </div>
          </div>

          {/* Customer Card */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {receipt.customerName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Customer</h3>
                <p className="text-gray-600">{receipt.customerName}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>📧 {receipt.customerEmail}</p>
              {receipt.customerPhone && <p>📱 {receipt.customerPhone}</p>}
            </div>
          </div>

          {/* Creative Items */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🛍️</span>
              Purchase Items
            </h3>
            <div className="space-y-3">
              {receipt.items.map((item, index) => (
                <div key={index} className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-4 border-l-4 border-gradient-to-b from-cyan-400 to-blue-500 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="bg-cyan-100 px-2 py-1 rounded-full">Qty: {item.quantity}</span>
                        <span className="bg-blue-100 px-2 py-1 rounded-full">Price: {formatCurrency(item.price, receipt.currency)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(item.amount, receipt.currency)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Creative Totals */}
          <div className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 text-white rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="space-y-3">
                <div className="flex justify-between text-cyan-100">
                  <span className="flex items-center"><span className="mr-2">💰</span>Subtotal</span>
                  <span>{formatCurrency(receipt.subtotal, receipt.currency)}</span>
                </div>
                {receipt.discountAmount > 0 && (
                  <div className="flex justify-between text-yellow-200">
                    <span className="flex items-center"><span className="mr-2">🎉</span>Discount</span>
                    <span>-{formatCurrency(receipt.discountAmount, receipt.currency)}</span>
                  </div>
                )}
                {receipt.taxAmount > 0 && (
                  <div className="flex justify-between text-cyan-100">
                    <span className="flex items-center"><span className="mr-2">📊</span>Tax</span>
                    <span>{formatCurrency(receipt.taxAmount, receipt.currency)}</span>
                  </div>
                )}
                <div className="border-t border-cyan-300 pt-3">
                  <div className="flex justify-between text-2xl font-bold">
                    <span className="flex items-center"><span className="mr-2">🎯</span>Total</span>
                    <span>{formatCurrency(receipt.total, receipt.currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {receipt.notes && (
            <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-l-4 border-yellow-400">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                <span className="mr-2">📝</span>
                Special Notes
              </h4>
              <p className="text-gray-700">{receipt.notes}</p>
            </div>
          )}

          {/* Creative Footer */}
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl p-6">
              <div className="text-4xl mb-3">🙏</div>
              <p className="text-xl font-bold text-gray-900 mb-2">Thank You!</p>
              <p className="text-gray-600">We appreciate your business and look forward to serving you again!</p>
              {receipt.businessProfile.website && (
                <p className="text-sm text-blue-600 mt-2">🌐 {receipt.businessProfile.website}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ReceiptTemplate;