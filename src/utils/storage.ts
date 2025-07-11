import { BusinessProfile, Receipt } from '../types';

const STORAGE_KEYS = {
  BUSINESS_PROFILES: 'receipt_business_profiles',
  RECEIPTS: 'receipt_receipts',
  CURRENT_PROFILE: 'receipt_current_profile',
  SETTINGS: 'receipt_settings',
};

// Helper function to convert date strings back to Date objects
const convertDatesToObjects = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    // Check if string looks like a date
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    if (dateRegex.test(obj)) {
      return new Date(obj);
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertDatesToObjects);
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Convert known date fields
        if (key === 'transactionDate' || key === 'createdAt' || key === 'updatedAt') {
          converted[key] = obj[key] ? new Date(obj[key]) : obj[key];
        } else {
          converted[key] = convertDatesToObjects(obj[key]);
        }
      }
    }
    return converted;
  }
  
  return obj;
};

export const storageUtils = {
  // Business Profiles
  getBusinessProfiles: (): BusinessProfile[] => {
    const profiles = localStorage.getItem(STORAGE_KEYS.BUSINESS_PROFILES);
    if (!profiles) return [];
    
    const parsedProfiles = JSON.parse(profiles);
    return parsedProfiles.map((profile: any) => convertDatesToObjects(profile));
  },

  saveBusinessProfile: (profile: BusinessProfile): void => {
    const profiles = storageUtils.getBusinessProfiles();
    const existingIndex = profiles.findIndex(p => p.id === profile.id);
    
    if (existingIndex >= 0) {
      profiles[existingIndex] = profile;
    } else {
      profiles.push(profile);
    }
    
    localStorage.setItem(STORAGE_KEYS.BUSINESS_PROFILES, JSON.stringify(profiles));
  },

  deleteBusinessProfile: (id: string): void => {
    const profiles = storageUtils.getBusinessProfiles();
    const filteredProfiles = profiles.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.BUSINESS_PROFILES, JSON.stringify(filteredProfiles));
  },

  // Current Profile
  getCurrentProfile: (): BusinessProfile | null => {
    const profile = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE);
    if (!profile) return null;
    
    const parsedProfile = JSON.parse(profile);
    return convertDatesToObjects(parsedProfile);
  },

  setCurrentProfile: (profile: BusinessProfile): void => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, JSON.stringify(profile));
  },

  // Receipts
  getReceipts: (): Receipt[] => {
    const receipts = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
    if (!receipts) return [];
    
    const parsedReceipts = JSON.parse(receipts);
    return parsedReceipts.map((receipt: any) => convertDatesToObjects(receipt));
  },

  saveReceipt: (receipt: Receipt): void => {
    const receipts = storageUtils.getReceipts();
    const existingIndex = receipts.findIndex(r => r.id === receipt.id);
    
    if (existingIndex >= 0) {
      receipts[existingIndex] = receipt;
    } else {
      receipts.push(receipt);
    }
    
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
  },

  deleteReceipt: (id: string): void => {
    const receipts = storageUtils.getReceipts();
    const filteredReceipts = receipts.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(filteredReceipts));
  },

  getReceiptById: (id: string): Receipt | null => {
    const receipts = storageUtils.getReceipts();
    return receipts.find(r => r.id === id) || null;
  },

  // Settings
  getSettings: (): any => {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : {
      currency: 'USD',
      taxRate: 0,
      language: 'en',
      dateFormat: 'MM/dd/yyyy',
    };
  },

  saveSettings: (settings: any): void => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
};