import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { Property } from './types';
import { Inquiry } from './useInquiries';
import { AgentProfile } from './useProperties';

// Firebase configuration provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyAfVPQ4hXkTluKGJ9lHnPAf-jUho9OpQp4",
  authDomain: "property-9d4cb.firebaseapp.com",
  projectId: "property-9d4cb",
  storageBucket: "property-9d4cb.firebasestorage.app",
  messagingSenderId: "714394598161",
  appId: "1:714394598161:web:dcea0d63d11ca9cd686ab0",
  measurementId: "G-KTDHNPSMWD"
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
    // Forcing long polling guarantees connectivity inside highly restricted sandboxed iframe environments
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true
    });
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

// --- Firestore Helpers ---

// Properties Collection
export async function getDbProperties(): Promise<Property[]> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }
  const colRef = collection(db, 'properties');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  const list: Property[] = [];
  snapshot.forEach((docSnap) => {
    list.push({ id: docSnap.id, ...docSnap.data() } as Property);
  });
  return list;
}

export async function saveDbProperty(property: Property): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }
  const docRef = doc(db, 'properties', property.id);
  await setDoc(docRef, { ...property });
}

export async function deleteDbProperty(id: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }
  const docRef = doc(db, 'properties', id);
  await deleteDoc(docRef);
}

// Inquiries Collection
export async function getDbInquiries(): Promise<Inquiry[]> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }
  const colRef = collection(db, 'inquiries');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  const list: Inquiry[] = [];
  snapshot.forEach((docSnap) => {
    list.push({ id: docSnap.id, ...docSnap.data() } as Inquiry);
  });
  return list;
}

export async function saveDbInquiry(inquiry: Inquiry): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }
  const docRef = doc(db, 'inquiries', inquiry.id);
  await setDoc(docRef, { ...inquiry });
}

export async function clearDbInquiries(inquiries: Inquiry[]): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }
  for (const inquiry of inquiries) {
    const docRef = doc(db, 'inquiries', inquiry.id);
    await deleteDoc(docRef);
  }
}

// Agent Profile
export async function getDbAgentProfile(): Promise<AgentProfile | null> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }
  const docRef = doc(db, 'settings', 'agentProfile');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as AgentProfile;
  }
  return null;
}

export async function saveDbAgentProfile(profile: AgentProfile): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }
  const docRef = doc(db, 'settings', 'agentProfile');
  await setDoc(docRef, { ...profile });
}
