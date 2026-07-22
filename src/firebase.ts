import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  get, 
  set, 
  remove,
  onValue
} from 'firebase/database';
import { Property } from './types';
import { Inquiry } from './useInquiries';
import { AgentProfile } from './useProperties';

// Firebase Realtime Database configuration provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyAfVPQ4hXkTluKGJ9lHnPAf-jUho9OpQp4",
  authDomain: "property-9d4cb.firebaseapp.com",
  projectId: "property-9d4cb",
  storageBucket: "property-9d4cb.firebasestorage.app",
  messagingSenderId: "714394598161",
  appId: "1:714394598161:web:dcea0d63d11ca9cd686ab0",
  measurementId: "G-KTDHNPSMWD",
  databaseURL: "https://property-9d4cb-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Check if configuration is present
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId
);

let db: any = null;

if (isFirebaseConfigured) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getDatabase(app);
  } catch (error) {
    console.error('Error initializing Firebase Realtime Database:', error);
  }
}

// --- Realtime Database Helpers ---

// Properties Node
export async function getDbProperties(): Promise<Property[]> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }
  const dbRef = ref(db, 'properties');
  const snapshot = await get(dbRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    if (!data) return [];
    
    const list: Property[] = Object.keys(data).map((key) => ({
      id: key,
      ...data[key]
    }));
    
    // Sort descending by createdAt (latest first)
    return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }
  return [];
}

export async function saveDbProperty(property: Property): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }
  const dbRef = ref(db, `properties/${property.id}`);
  const sanitized = JSON.parse(JSON.stringify(property));
  await set(dbRef, sanitized);
}

export async function deleteDbProperty(id: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }
  const dbRef = ref(db, `properties/${id}`);
  await remove(dbRef);
}

// Inquiries Node
export async function getDbInquiries(): Promise<Inquiry[]> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }
  const dbRef = ref(db, 'inquiries');
  const snapshot = await get(dbRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    if (!data) return [];
    
    const list: Inquiry[] = Object.keys(data).map((key) => ({
      id: key,
      ...data[key]
    }));
    
    // Sort descending by createdAt (latest first)
    return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }
  return [];
}

export async function saveDbInquiry(inquiry: Inquiry): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }
  const dbRef = ref(db, `inquiries/${inquiry.id}`);
  const sanitized = JSON.parse(JSON.stringify(inquiry));
  await set(dbRef, sanitized);
}

export async function clearDbInquiries(inquiries: Inquiry[]): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }
  const dbRef = ref(db, 'inquiries');
  await remove(dbRef);
}

// Agent Profile Settings Node
export async function getDbAgentProfile(): Promise<AgentProfile | null> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }
  const dbRef = ref(db, 'settings/agentProfile');
  const snapshot = await get(dbRef);
  if (snapshot.exists()) {
    return snapshot.val() as AgentProfile;
  }
  return null;
}

export async function saveDbAgentProfile(profile: AgentProfile): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }
  const dbRef = ref(db, 'settings/agentProfile');
  const sanitized = JSON.parse(JSON.stringify(profile));
  await set(dbRef, sanitized);
}

// Real-time Subscriptions
export function subscribeDbProperties(
  onData: (properties: Property[]) => void,
  onError?: (err: Error) => void
): (() => void) | null {
  if (!isFirebaseConfigured || !db) return null;

  const dbRef = ref(db, 'properties');
  const unsubscribe = onValue(
    dbRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (!data) {
          onData([]);
          return;
        }
        const list: Property[] = Object.keys(data).map((key) => {
          const item = data[key] || {};
          return {
            id: key,
            title: item.title || 'Untitled Property',
            price: typeof item.price === 'number' && !isNaN(item.price) ? item.price : Number(item.price) || 0,
            description: item.description || '',
            type: item.type === 'rent' ? 'rent' : 'sale',
            propertyType: item.propertyType || 'House',
            location: item.location || '',
            address: item.address || undefined,
            bedrooms: Number(item.bedrooms) || 0,
            bathrooms: Number(item.bathrooms) || 0,
            area: Number(item.area) || 0,
            imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
            additionalImages: Array.isArray(item.additionalImages) ? item.additionalImages : [],
            agentName: item.agentName || 'Daniel Wan',
            agentPhone: item.agentPhone || '01119602980',
            agentEmail: item.agentEmail || 'wandaniel554@gmail.com',
            agentPhoto: item.agentPhoto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80',
            status: item.status || 'available',
            amenities: Array.isArray(item.amenities) ? item.amenities : [],
            featured: Boolean(item.featured),
            createdAt: item.createdAt || new Date().toISOString()
          };
        });
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        onData(list);
      } else {
        onData([]);
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

export function subscribeDbInquiries(
  onData: (inquiries: Inquiry[]) => void,
  onError?: (err: Error) => void
): (() => void) | null {
  if (!isFirebaseConfigured || !db) return null;

  const dbRef = ref(db, 'inquiries');
  const unsubscribe = onValue(
    dbRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (!data) {
          onData([]);
          return;
        }
        const list: Inquiry[] = Object.keys(data).map((key) => {
          const item = data[key] || {};
          return {
            id: key,
            propertyId: item.propertyId || '',
            propertyTitle: item.propertyTitle || '',
            propertyImage: item.propertyImage || '',
            clientName: item.clientName || 'Anonymous Client',
            clientEmail: item.clientEmail || '',
            clientPhone: item.clientPhone || '',
            message: item.message || '',
            createdAt: item.createdAt || new Date().toISOString()
          };
        });
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        onData(list);
      } else {
        onData([]);
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

