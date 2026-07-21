import { useState, useEffect } from 'react';
import { Property } from './types';
import { INITIAL_PROPERTIES } from './initialData';
import { 
  isFirebaseConfigured, 
  getDbProperties, 
  saveDbProperty, 
  deleteDbProperty, 
  getDbAgentProfile, 
  saveDbAgentProfile 
} from './firebase';

const STORAGE_KEY = 'prime_properties_data_v2';
const AGENT_STORAGE_KEY = 'prime_agent_profile_v2';

export interface AgentProfile {
  name: string;
  phone: string;
  email: string;
  photo: string;
}

const DEFAULT_AGENT: AgentProfile = {
  name: 'Daniel Wan',
  phone: '01119602980',
  email: 'wandaniel554@gmail.com',
  photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80'
};

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [agentProfile, setAgentProfile] = useState<AgentProfile>(DEFAULT_AGENT);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState<'loading' | 'connected' | 'offline' | 'error' | 'not_configured'>('loading');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      // 1. ALWAYS load from LocalStorage first for instant startup & robust offline fail-safe
      let activeAgent = DEFAULT_AGENT;
      let localProperties: Property[] = [];
      
      try {
        const storedAgent = localStorage.getItem(AGENT_STORAGE_KEY);
        if (storedAgent) {
          const parsed = JSON.parse(storedAgent);
          if (parsed.phone === '+60 12-345 6789' || !parsed.phone) {
            parsed.phone = '01119602980';
          }
          activeAgent = parsed;
        } else {
          localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(DEFAULT_AGENT));
        }
      } catch (e) {
        console.error('Failed to parse cached agent profile:', e);
      }
      setAgentProfile(activeAgent);

      try {
        const storedProps = localStorage.getItem(STORAGE_KEY);
        if (storedProps) {
          localProperties = JSON.parse(storedProps);
        } else {
          // Fallback to initial properties
          localProperties = INITIAL_PROPERTIES.map(p => ({
            ...p,
            agentName: activeAgent.name,
            agentPhone: activeAgent.phone,
            agentEmail: activeAgent.email,
            agentPhoto: activeAgent.photo
          }));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(localProperties));
        }
      } catch (e) {
        console.error('Failed to parse cached properties:', e);
        localProperties = INITIAL_PROPERTIES;
      }
      setProperties(localProperties);

      // 2. If Firebase is configured, try to asynchronously fetch the latest live database state to synchronize
      if (isFirebaseConfigured) {
        setFirebaseStatus('loading');
        try {
          // Try to load Agent Profile from Firebase
          let liveAgent = activeAgent;
          try {
            const dbAgent = await getDbAgentProfile();
            if (dbAgent) {
              liveAgent = dbAgent;
              setAgentProfile(liveAgent);
              localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(liveAgent));
            } else {
              // Write default agent to DB if database is currently empty
              await saveDbAgentProfile(activeAgent);
            }
          } catch (agentErr: any) {
            console.warn('Firebase Agent profile load failed/offline:', agentErr.message || agentErr);
            // Proceed to properties regardless of agent profile success
          }

          // Try to load Properties from Firebase
          const dbProperties = await getDbProperties();
          if (dbProperties && dbProperties.length > 0) {
            // Ensure agent details are synchronized
            const synced = dbProperties.map(p => ({
              ...p,
              agentName: liveAgent.name,
              agentPhone: liveAgent.phone,
              agentEmail: liveAgent.email,
              agentPhoto: liveAgent.photo
            }));
            setProperties(synced);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
          } else {
            // Database is empty, seed it with our local properties
            for (const p of localProperties) {
              await saveDbProperty(p);
            }
          }
          
          setFirebaseStatus('connected');
        } catch (err: any) {
          const errMsg = err.message || String(err);
          console.error('Firebase synchronisation failed, running in Offline Fail-Safe mode:', errMsg);
          
          if (errMsg.includes('offline') || errMsg.includes('network') || errMsg.includes('failed-precondition') || errMsg.includes('Permission denied')) {
            setFirebaseStatus('offline');
          } else {
            setFirebaseStatus('error');
          }
        }
      } else {
        setFirebaseStatus('not_configured');
      }

      setLoading(false);
    }

    loadData();
  }, []);

  const saveToStorage = async (updatedList: Property[]) => {
    setProperties(updatedList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to save properties to local storage cache:', e);
    }
  };

  const updateAgentProfile = async (newProfile: AgentProfile) => {
    try {
      setAgentProfile(newProfile);
      localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(newProfile));
      
      const updated = properties.map(p => ({
        ...p,
        agentName: newProfile.name,
        agentPhone: newProfile.phone,
        agentEmail: newProfile.email,
        agentPhoto: newProfile.photo
      }));
      await saveToStorage(updated);

      if (isFirebaseConfigured) {
        try {
          await saveDbAgentProfile(newProfile);
          for (const p of updated) {
            await saveDbProperty(p);
          }
          setFirebaseStatus('connected');
        } catch (e) {
          console.error('Failed to sync agent profile to Firebase (offline/error):', e);
          setFirebaseStatus('offline');
        }
      }
    } catch (e) {
      console.error('Failed to save agent profile:', e);
    }
  };

  const addProperty = async (newProperty: Omit<Property, 'id' | 'createdAt'>) => {
    const propertyWithId: Property = {
      ...newProperty,
      agentName: agentProfile.name,
      agentPhone: agentProfile.phone,
      agentEmail: agentProfile.email,
      agentPhoto: agentProfile.photo,
      id: `prop-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    const updated = [propertyWithId, ...properties];
    await saveToStorage(updated);

    if (isFirebaseConfigured) {
      try {
        await saveDbProperty(propertyWithId);
        setFirebaseStatus('connected');
      } catch (e) {
        console.error('Failed to sync added property to Firebase:', e);
        setFirebaseStatus('offline');
      }
    }
    return propertyWithId;
  };

  const updateProperty = async (updatedProperty: Property) => {
    const updatedModel = {
      ...updatedProperty,
      agentName: agentProfile.name,
      agentPhone: agentProfile.phone,
      agentEmail: agentProfile.email,
      agentPhoto: agentProfile.photo
    };

    const updated = properties.map(p => 
      p.id === updatedProperty.id ? updatedModel : p
    );
    await saveToStorage(updated);

    if (isFirebaseConfigured) {
      try {
        await saveDbProperty(updatedModel);
        setFirebaseStatus('connected');
      } catch (e) {
        console.error('Failed to sync updated property to Firebase:', e);
        setFirebaseStatus('offline');
      }
    }
  };

  const deleteProperty = async (id: string) => {
    const updated = properties.filter(p => p.id !== id);
    await saveToStorage(updated);

    if (isFirebaseConfigured) {
      try {
        await deleteDbProperty(id);
        setFirebaseStatus('connected');
      } catch (e) {
        console.error('Failed to sync property deletion to Firebase:', e);
        setFirebaseStatus('offline');
      }
    }
  };

  const getPropertyById = (id: string) => {
    return properties.find(p => p.id === id);
  };

  const resetToDefault = async () => {
    const initialized = INITIAL_PROPERTIES.map(p => ({
      ...p,
      agentName: agentProfile.name,
      agentPhone: agentProfile.phone,
      agentEmail: agentProfile.email,
      agentPhoto: agentProfile.photo
    }));
    await saveToStorage(initialized);

    if (isFirebaseConfigured) {
      try {
        // Clear all current in db first
        for (const p of properties) {
          await deleteDbProperty(p.id);
        }
        for (const p of initialized) {
          await saveDbProperty(p);
        }
        setFirebaseStatus('connected');
      } catch (e) {
        console.error('Failed to sync property reset to Firebase:', e);
        setFirebaseStatus('offline');
      }
    }
  };

  const refreshInventory = async () => {
    setRefreshing(true);
    try {
      let activeAgent = agentProfile;
      
      // 1. If Firebase is configured, fetch the latest database state
      if (isFirebaseConfigured) {
        setFirebaseStatus('loading');
        
        // Try refreshing Agent Profile
        try {
          const dbAgent = await getDbAgentProfile();
          if (dbAgent) {
            activeAgent = dbAgent;
            setAgentProfile(dbAgent);
            localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(dbAgent));
          }
        } catch (err: any) {
          console.warn('Failed to refresh agent profile:', err);
        }

        // Try refreshing Properties
        const dbProperties = await getDbProperties();
        if (dbProperties && dbProperties.length > 0) {
          const synced = dbProperties.map(p => ({
            ...p,
            agentName: activeAgent.name,
            agentPhone: activeAgent.phone,
            agentEmail: activeAgent.email,
            agentPhoto: activeAgent.photo
          }));
          setProperties(synced);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
        } else {
          // If remote database is empty, push our local properties up to seed it
          const localStored = localStorage.getItem(STORAGE_KEY);
          const toSeed = localStored ? JSON.parse(localStored) : properties;
          for (const p of toSeed) {
            await saveDbProperty(p);
          }
        }
        setFirebaseStatus('connected');
      } else {
        // Local only: load from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setProperties(JSON.parse(stored));
        }
      }
    } catch (error: any) {
      console.error('Manual inventory refresh failed:', error);
      const errMsg = error.message || String(error);
      if (errMsg.includes('offline') || errMsg.includes('network') || errMsg.includes('failed-precondition') || errMsg.includes('Permission denied')) {
        setFirebaseStatus('offline');
      } else {
        setFirebaseStatus('error');
      }
    } finally {
      setRefreshing(false);
    }
  };

  return {
    properties,
    agentProfile,
    loading,
    firebaseStatus,
    addProperty,
    updateProperty,
    deleteProperty,
    getPropertyById,
    resetToDefault,
    updateAgentProfile,
    refreshing,
    refreshInventory
  };
}


