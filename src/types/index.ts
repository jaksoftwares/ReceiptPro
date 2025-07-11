export interface BusinessProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website?: string;
  logo?: string;
  taxNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceiptItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  amount: number;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  businessProfile: BusinessProfile;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  items: ReceiptItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  total: number;
  notes?: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'mobile_money' | 'check' | 'other';
  transactionDate: Date;
  status: 'completed' | 'refunded' | 'partial_refund';
  template: 'modern' | 'classic' | 'minimal' | 'professional' | 'corporate' | 'elegant' | 'creative';
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceiptTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
}

export interface EmailSettings {
  serviceId: string;
  templateId: string;
  publicKey: string;
}