import { Receipt, ReceiptItem } from '../types';

export const generateReceiptNumber = (): string => {
  const prefix = 'RCP';
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${prefix}-${year}${month}${day}-${random}`;
};

export const calculateReceiptTotals = (
  items: ReceiptItem[],
  taxRate: number,
  discountRate: number
): {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
} => {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = subtotal * (discountRate / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (taxRate / 100);
  const total = subtotal - discountAmount + taxAmount;

  return {
    subtotal,
    taxAmount,
    discountAmount,
    total,
  };
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const getStatusColor = (status: Receipt['status']): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'refunded':
      return 'bg-red-100 text-red-800';
    case 'partial_refund':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusIcon = (status: Receipt['status']): string => {
  switch (status) {
    case 'completed':
      return '✅';
    case 'refunded':
      return '↩️';
    case 'partial_refund':
      return '⚠️';
    default:
      return '📄';
  }
};

export const getPaymentMethodIcon = (method: Receipt['paymentMethod']): string => {
  switch (method) {
    case 'cash':
      return '💵';
    case 'card':
      return '💳';
    case 'bank_transfer':
      return '🏦';
    case 'mobile_money':
      return '📱';
    case 'check':
      return '📝';
    default:
      return '💰';
  }
};