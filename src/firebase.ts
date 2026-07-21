import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  get, 
  set, 
  remove 
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
  await set(dbRef, { ...property });
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
  await set(dbRef, { ...inquiry });
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
  await set(dbRef, { ...profile });
}
