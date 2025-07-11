import emailjs from 'emailjs-com';
import { Receipt } from '../types';
import { formatCurrency } from './receiptHelpers';
import { format } from 'date-fns';

// Email configuration - these should be set in settings
const EMAIL_CONFIG = {
  SERVICE_ID: 'your_service_id', // Replace with your EmailJS service ID
  TEMPLATE_ID: 'your_template_id', // Replace with your EmailJS template ID
  PUBLIC_KEY: 'your_public_key', // Replace with your EmailJS public key
};

export interface EmailData {
  to_email: string;
  to_name: string;
  from_name: string;
  from_email: string;
  subject: string;
  message: string;
  receipt_number: string;
  receipt_total: string;
  transaction_date: string;
  business_name: string;
}

export const sendReceiptEmail = async (
  receipt: Receipt,
  customMessage?: string,
  attachmentUrl?: string
): Promise<boolean> => {
  try {
    // Initialize EmailJS if not already done
    if (!emailjs.init) {
      emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);
    }

    const emailData: EmailData = {
      to_email: receipt.customerEmail,
      to_name: receipt.customerName,
      from_name: receipt.businessProfile.name,
      from_email: receipt.businessProfile.email,
      subject: `Receipt ${receipt.receiptNumber} from ${receipt.businessProfile.name}`,
      message: customMessage || generateDefaultEmailMessage(receipt),
      receipt_number: receipt.receiptNumber,
      receipt_total: formatCurrency(receipt.total, receipt.currency),
      transaction_date: format(new Date(receipt.transactionDate), 'MMMM dd, yyyy'),
      business_name: receipt.businessProfile.name,
    };

    const response = await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATE_ID,
      emailData,
      EMAIL_CONFIG.PUBLIC_KEY
    );

    return response.status === 200;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

const generateDefaultEmailMessage = (receipt: Receipt): string => {
  return `Dear ${receipt.customerName},

Thank you for your purchase! Please find attached your receipt ${receipt.receiptNumber} for your recent transaction.

Receipt Details:
- Receipt Number: ${receipt.receiptNumber}
- Transaction Date: ${format(new Date(receipt.transactionDate), 'MMMM dd, yyyy')}
- Payment Method: ${receipt.paymentMethod.replace('_', ' ').toUpperCase()}
- Total Amount: ${formatCurrency(receipt.total, receipt.currency)}

${receipt.notes ? `\nAdditional Notes:\n${receipt.notes}` : ''}

Thank you for choosing ${receipt.businessProfile.name}! We appreciate your business.

Best regards,
${receipt.businessProfile.name}
${receipt.businessProfile.email}
${receipt.businessProfile.phone}`;
};

export const validateEmailConfiguration = (): boolean => {
  return !!(EMAIL_CONFIG.SERVICE_ID && EMAIL_CONFIG.TEMPLATE_ID && EMAIL_CONFIG.PUBLIC_KEY);
};

export const updateEmailConfiguration = (config: {
  serviceId: string;
  templateId: string;
  publicKey: string;
}): void => {
  EMAIL_CONFIG.SERVICE_ID = config.serviceId;
  EMAIL_CONFIG.TEMPLATE_ID = config.templateId;
  EMAIL_CONFIG.PUBLIC_KEY = config.publicKey;
};