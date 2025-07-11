import React, { useState } from 'react';
import { X, Send, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { Receipt } from '../../types';
import { sendReceiptEmail } from '../../utils/emailService';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: Receipt;
}

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, receipt }) => {
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSendEmail = async () => {
    setIsSending(true);
    setEmailStatus('idle');

    try {
      const success = await sendReceiptEmail(receipt, customMessage);
      
      if (success) {
        setEmailStatus('success');
        setTimeout(() => {
          onClose();
          setEmailStatus('idle');
          setCustomMessage('');
        }, 2000);
      } else {
        setEmailStatus('error');
      }
    } catch (error) {
      console.error('Email sending error:', error);
      setEmailStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  const defaultMessage = `Dear ${receipt.customerName},

Thank you for your purchase! Please find attached your receipt ${receipt.receiptNumber} for your recent transaction.

Receipt Details:
- Receipt Number: ${receipt.receiptNumber}
- Total Amount: ${receipt.currency} ${receipt.total.toFixed(2)}
- Transaction Date: ${new Date(receipt.transactionDate).toLocaleDateString()}
- Payment Method: ${receipt.paymentMethod.replace('_', ' ').toUpperCase()}

${receipt.notes ? `\nAdditional Notes:\n${receipt.notes}` : ''}

Thank you for choosing ${receipt.businessProfile.name}! We appreciate your business.

Best regards,
${receipt.businessProfile.name}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Send Receipt via Email</h3>
              <p className="text-sm text-gray-500">Receipt #{receipt.receiptNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Recipient Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Recipient</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Name:</strong> {receipt.customerName}</p>
              <p><strong>Email:</strong> {receipt.customerEmail}</p>
            </div>
          </div>

          {/* Email Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={`Receipt ${receipt.receiptNumber} from ${receipt.businessProfile.name}`}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          {/* Email Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={customMessage || defaultMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your custom message..."
            />
          </div>

          {/* Status Messages */}
          {emailStatus === 'success' && (
            <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Email sent successfully!
              </span>
            </div>
          )}

          {emailStatus === 'error' && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Failed to send email. Please check your email configuration in settings.
              </span>
            </div>
          )}

          {/* Email Configuration Warning */}
          <div className="flex items-start space-x-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Email Configuration Required</p>
              <p>To use this feature, you need to configure EmailJS in your settings. This includes setting up your service ID, template ID, and public key.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSendEmail}
            disabled={isSending || !receipt.customerEmail}
            className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;