import { useState, useEffect } from 'react';
import { 
  isFirebaseConfigured, 
  getDbInquiries, 
  saveDbInquiry, 
  clearDbInquiries as clearDbInquiriesApi 
} from './firebase';

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  message: string;
  createdAt: string;
}

const STORAGE_KEY = 'prime_properties_inquiries';

export function useInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      // 1. ALWAYS load from LocalStorage first for instant startup & robust offline fallback
      let localInquiries: Inquiry[] = [];
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          localInquiries = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Failed to parse cached inquiries:', e);
      }
      setInquiries(localInquiries);

      // 2. If Firebase is configured, try to asynchronously fetch live inquiries
      if (isFirebaseConfigured) {
        try {
          const dbInquiries = await getDbInquiries();
          if (dbInquiries) {
            setInquiries(dbInquiries);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dbInquiries));
          }
        } catch (e) {
          console.error('Failed to load inquiries from Firebase, running in offline backup mode:', e);
        }
      }

      setLoading(false);
    }
    
    loadData();
  }, []);

  const saveToStorage = async (updatedList: Inquiry[]) => {
    setInquiries(updatedList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to save inquiries to local storage:', e);
    }
  };

  const addInquiry = async (newInquiry: Omit<Inquiry, 'id' | 'createdAt'>) => {
    const inquiryWithId: Inquiry = {
      ...newInquiry,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [inquiryWithId, ...inquiries];
    await saveToStorage(updated);

    if (isFirebaseConfigured) {
      try {
        await saveDbInquiry(inquiryWithId);
      } catch (e) {
        console.error('Failed to save inquiry to Firebase (offline/error):', e);
      }
    }
    return inquiryWithId;
  };

  const clearInquiries = async () => {
    const listToClear = [...inquiries];
    await saveToStorage([]);

    if (isFirebaseConfigured) {
      try {
        await clearDbInquiriesApi(listToClear);
      } catch (e) {
        console.error('Failed to clear inquiries in Firebase (offline/error):', e);
      }
    }
  };

  return {
    inquiries,
    loading,
    addInquiry,
    clearInquiries
  };
}

