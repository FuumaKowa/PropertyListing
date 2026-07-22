import React, { useState, useEffect, useRef, FormEvent, DragEvent, ChangeEvent } from 'react';
import { Plus, Edit, Trash2, ShieldCheck, Mail, Phone, Calendar, Upload, Link2, Check, Lock, ChevronRight, RefreshCw, Layers, ArrowLeftRight, User, KeySquare, Database, CloudOff, Image, Eye, Images, X } from 'lucide-react';
import { Property, PropertyFilters } from '../types';
import { PRESET_IMAGES } from '../initialData';
import { motion, AnimatePresence } from 'motion/react';
import { AgentProfile } from '../useProperties';
import { isFirebaseConfigured } from '../firebase';
import { compressImageFile } from '../utils/imageCompressor';
import ConfirmModal from './ConfirmModal';

interface AdminPanelProps {
  properties: Property[];
  agentProfile: AgentProfile;
  onUpdateAgentProfile: (profile: AgentProfile) => void;
  inquiries: Array<{
    id: string;
    propertyId: string;
    propertyTitle: string;
    propertyImage: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    message: string;
    createdAt: string;
  }>;
  onAddProperty: (property: Omit<Property, 'id' | 'createdAt'>) => void;
  onUpdateProperty: (property: Property) => void;
  onDeleteProperty: (id: string) => void;
  onResetToDefault: () => void;
  onClearInquiries: () => void;
  firebaseStatus?: 'loading' | 'connected' | 'offline' | 'error' | 'not_configured';
  firebaseErrorMessage?: string | null;
  isRefreshing?: boolean;
  onRefresh?: () => Promise<void>;
}

const COMMON_AMENITIES = [
  'Pool', 'Gym', 'Private Garden', 'Garage (2 Cars)', 'Garage (3 Cars)', 
  'Home Cinema', 'Wine Cellar', 'Smart Home System', 'Chef\'s Kitchen', 
  'Fireplace', 'Rooftop Access', 'EV Charger', 'Solar Power', 'Concierge'
];

export default function AdminPanel({
  properties,
  agentProfile,
  onUpdateAgentProfile,
  inquiries,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
  onResetToDefault,
  onClearInquiries,
  firebaseStatus = 'not_configured',
  firebaseErrorMessage = null,
  isRefreshing = false,
  onRefresh
}: AdminPanelProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);

  // Active Admin Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'inquiries' | 'agent-profile'>('inventory');

  // Agent Profile Edit States
  const [profileName, setProfileName] = useState(agentProfile.name);
  const [profilePhone, setProfilePhone] = useState(agentProfile.phone);
  const [profileEmail, setProfileEmail] = useState(agentProfile.email);
  const [profilePhoto, setProfilePhoto] = useState(agentProfile.photo);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    setProfileName(agentProfile.name);
    setProfilePhone(agentProfile.phone);
    setProfileEmail(agentProfile.email);
    setProfilePhoto(agentProfile.photo);
  }, [agentProfile]);

  const handleProfileSave = (e: FormEvent) => {
    e.preventDefault();
    onUpdateAgentProfile({
      name: profileName,
      phone: profilePhone,
      email: profileEmail,
      photo: profilePhoto
    });
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 4000);
  };

  // Form Drawer State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<'sale' | 'rent'>('sale');
  const [propertyType, setPropertyType] = useState<Property['propertyType']>('House');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [area, setArea] = useState('2000');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Property['status']>('available');
  const [featured, setFeatured] = useState(false);

  // Additional pictures state
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [newAdditionalUrl, setNewAdditionalUrl] = useState('');
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox / Gallery Preview states
  const [selectedPreviewProperty, setSelectedPreviewProperty] = useState<Property | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

  // Image Source Option: 'preset' | 'url' | 'upload'
  const [imageOption, setImageOption] = useState<'preset' | 'url' | 'upload'>('preset');
  const [selectedPresetUrl, setSelectedPresetUrl] = useState(PRESET_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadedBase64, setUploadedBase64] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState('');

  // Agent Picker
  const [selectedAgentIndex, setSelectedAgentIndex] = useState(0);
  const [useCustomAgent, setUseCustomAgent] = useState(false);
  const [customAgentName, setCustomAgentName] = useState('');
  const [customAgentPhone, setCustomAgentPhone] = useState('');
  const [customAgentEmail, setCustomAgentEmail] = useState('');

  // Custom Confirmation Modal States
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isClearInquiriesConfirmOpen, setIsClearInquiriesConfirmOpen] = useState(false);
  const [isResetDefaultConfirmOpen, setIsResetDefaultConfirmOpen] = useState(false);

  // Handle Passcode Submission
  const handleAuthSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (passcode.toLowerCase() === 'admin') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
      setPasscode('');
    }
  };

  // Pre-fill form for Edit
  const openEditForm = (prop: Property) => {
    setEditingProperty(prop);
    setTitle(prop.title);
    setPrice(prop.price.toString());
    setType(prop.type);
    setPropertyType(prop.propertyType);
    setLocation(prop.location);
    setAddress(prop.address || '');
    setBedrooms(prop.bedrooms.toString());
    setBathrooms(prop.bathrooms.toString());
    setArea(prop.area.toString());
    setDescription(prop.description);
    setStatus(prop.status);
    setFeatured(prop.featured || false);
    setSelectedAmenities(prop.amenities);
    setAdditionalImages(prop.additionalImages || []);

    // Image source binding
    const matchedPreset = PRESET_IMAGES.find(pi => pi.url === prop.imageUrl);
    if (matchedPreset) {
      setImageOption('preset');
      setSelectedPresetUrl(prop.imageUrl);
    } else if (prop.imageUrl.startsWith('data:image')) {
      setImageOption('upload');
      setUploadedBase64(prop.imageUrl);
    } else {
      setImageOption('url');
      setCustomImageUrl(prop.imageUrl);
    }

    setIsFormOpen(true);
  };

  // Open empty form for Create
  const openCreateForm = () => {
    setEditingProperty(null);
    setTitle('');
    setPrice('');
    setType('sale');
    setPropertyType('House');
    setLocation('');
    setAddress('');
    setBedrooms('3');
    setBathrooms('2.5');
    setArea('2200');
    setDescription('');
    setStatus('available');
    setFeatured(false);
    setSelectedAmenities(['Pool', 'Garage (2 Cars)', 'Smart Home System']);
    setImageOption('preset');
    setSelectedPresetUrl(PRESET_IMAGES[0].url);
    setCustomImageUrl('');
    setUploadedBase64('');
    setAdditionalImages([]);
    setIsFormOpen(true);
  };

  // File upload handler
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleAdditionalFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }
      try {
        const compressedBase64 = await compressImageFile(file, 1200, 1200, 0.8);
        setAdditionalImages(prev => [...prev, compressedBase64]);
      } catch (err) {
        console.error('Image compression error:', err);
        alert('Failed to process image file.');
      }
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    try {
      const compressedBase64 = await compressImageFile(file, 1200, 1200, 0.8);
      setUploadedBase64(compressedBase64);
    } catch (err) {
      console.error('Image compression error:', err);
      alert('Failed to process image file.');
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Amenities toggle
  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  // Add custom amenity
  const handleAddCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !selectedAmenities.includes(trimmed)) {
      setSelectedAmenities([...selectedAmenities, trimmed]);
      setCustomAmenity('');
    }
  };

  // Submit form (Save / Create)
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!title || !price || !location || !description) {
      alert('Please fill in all mandatory fields.');
      return;
    }

    // Resolve Image URL
    let finalImageUrl = '';
    if (imageOption === 'preset') {
      finalImageUrl = selectedPresetUrl;
    } else if (imageOption === 'url') {
      finalImageUrl = customImageUrl || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80';
    } else {
      finalImageUrl = uploadedBase64 || PRESET_IMAGES[0].url;
    }

    // Resolve Agent (Always inherits the global agent profile)
    const agentDetails = {
      agentName: agentProfile.name,
      agentPhone: agentProfile.phone,
      agentEmail: agentProfile.email,
      agentPhoto: agentProfile.photo
    };

    const payload: Omit<Property, 'id' | 'createdAt'> = {
      title,
      price: parseFloat(price),
      description,
      type,
      propertyType,
      location,
      address: address.trim() || undefined,
      bedrooms: parseInt(bedrooms),
      bathrooms: parseFloat(bathrooms),
      area: parseInt(area),
      imageUrl: finalImageUrl,
      additionalImages: additionalImages,
      ...agentDetails,
      status,
      amenities: selectedAmenities,
      featured
    };

    if (editingProperty) {
      onUpdateProperty({
        ...payload,
        id: editingProperty.id,
        createdAt: editingProperty.createdAt,
        additionalImages: additionalImages
      });
    } else {
      onAddProperty(payload);
    }

    setIsFormOpen(false);
  };

  // Unlocked Admin View
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white p-8 shadow-2xl text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200 mb-6">
            <Lock className="h-6 w-6" />
          </div>

          <h2 className="font-sans text-xl font-black text-slate-900">Admin Authentication</h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-semibold uppercase tracking-wider">
            Protected Estate Database Management
          </p>

          <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
            <div className="relative">
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode (Hint: admin)"
                className="w-full rounded-lg border border-slate-250 px-4 py-3 text-center text-sm tracking-widest focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden transition-all placeholder:text-slate-400 placeholder:tracking-normal text-slate-800"
              />
            </div>

            {authError && (
              <p className="text-xs font-semibold text-rose-600">
                Invalid passcode. Please try again.
              </p>
            )}

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 px-4 shadow-md shadow-blue-200 transition-all cursor-pointer"
              >
                Authenticate
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAuthenticated(true);
                  setAuthError(false);
                }}
                className="w-full rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2 px-4 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <KeySquare className="h-3.5 w-3.5 text-slate-400" />
                <span>Demo Bypass Unlock</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Admin Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <div>
          <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
            Administrative Portal
          </span>
          <h2 className="font-sans text-2xl font-black text-slate-900 mt-1 leading-tight flex items-center gap-2">
            Estate Database Controls
            <ShieldCheck className="h-5 w-5 text-blue-600" />
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-3.5 font-medium">
            Real-time control panel to update property statuses, perform CRUD actions, and monitor customer inquiries.
          </p>
          <div className="flex items-center gap-2">
            {firebaseStatus === 'loading' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <RefreshCw className="h-3 w-3 text-blue-500 animate-spin" />
                <span>Connecting to Realtime Database...</span>
              </span>
            )}
            {firebaseStatus === 'connected' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                <Database className="h-3 w-3 text-emerald-500" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Realtime Database Active</span>
              </span>
            )}
            {firebaseStatus === 'offline' && (
              <div className="inline-flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <CloudOff className="h-3 w-3 text-amber-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Offline Sync Mode (Local Storage Backup)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Operating in offline fail-safe. Changes will sync when reconnecting.
                </span>
              </div>
            )}
            {firebaseStatus === 'error' && (
              <div className="inline-flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <CloudOff className="h-3 w-3 text-rose-500" />
                  <span>Firestore Connection Failed</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  (Fail-safe: data is preserved securely in your local browser storage)
                </span>
              </div>
            )}
            {firebaseStatus === 'not_configured' && (
              <div className="inline-flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  <CloudOff className="h-3 w-3 text-slate-400" />
                  <span>LocalStorage Mode</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  (Configure your Firebase keys in Settings ⚙️ secrets to persist cloud data!)
                </span>
              </div>
            )}
          </div>
          {firebaseErrorMessage && (
            <div className="mt-3.5 max-w-2xl p-4 rounded-xl border bg-rose-50/40 border-rose-200 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <CloudOff className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-950 font-sans">Database Synchronisation Failed</h4>
                  <p className="text-[11px] text-rose-900 font-mono mt-1 bg-white border border-rose-100 p-2.5 rounded-lg overflow-x-auto shadow-xs">
                    {firebaseErrorMessage}
                  </p>
                  <p className="mt-2 text-slate-600 leading-relaxed text-[11px] font-medium">
                    💡 <strong>Diagnose & Resolution:</strong> This happens when your Firebase Realtime Database rules deny read or write permissions to the client.
                  </p>
                  <p className="mt-1.5 text-slate-500 leading-relaxed text-[11px]">
                    To fix this: Go to your <strong>Firebase Console</strong> &gt; <strong>Realtime Database</strong> &gt; <strong>Rules</strong> tab, and set your security rules to allow read/write access:
                  </p>
                  <pre className="mt-2 p-3 bg-slate-900 text-slate-200 font-mono text-[10px] rounded-lg overflow-x-auto select-all shadow-inner">
{`{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}`}
                  </pre>
                  <p className="mt-2 text-slate-500 leading-relaxed text-[11px]">
                    Or, if this is a temporary development environment and you wish to bypass authorization entirely:
                  </p>
                  <pre className="mt-2 p-3 bg-slate-900 text-slate-200 font-mono text-[10px] rounded-lg overflow-x-auto select-all shadow-inner">
{`{
  "rules": {
    ".read": true,
    ".write": true
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openCreateForm}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 shadow-md shadow-blue-200 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Property</span>
          </button>

          <button
            onClick={() => {
              if (onRefresh) {
                onRefresh();
              }
            }}
            disabled={isRefreshing}
            className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 text-slate-700 font-bold text-xs py-2.5 px-3.5 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:cursor-not-allowed"
            title="Fetch latest listings and inquiries from Realtime Database"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Inventory'}</span>
          </button>

          <button
            onClick={() => setIsResetDefaultConfirmOpen(true)}
            className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 px-3.5 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset to original mock database listings"
          >
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            <span>Reset to Default Sample</span>
          </button>
        </div>
      </div>

      {/* Admin Subtabs Menu */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`relative border-b-2 px-4 py-3 text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'inventory'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Listing Inventory ({properties.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inquiries')}
          className={`relative border-b-2 px-4 py-3 text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'inquiries'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-800'
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Client Inquiries ({inquiries.length})</span>
          {inquiries.length > 0 && (
            <span className="rounded bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[10px] font-black leading-none">
              {inquiries.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('agent-profile')}
          className={`relative border-b-2 px-4 py-3 text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'agent-profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-800'
          }`}
        >
          <User className="h-4 w-4" />
          <span>My Agent Profile</span>
        </button>
      </div>

      {/* Dynamic Sub-tab Area */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'inventory' && (
          <motion.div
            key="inventory-subtab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs"
          >
            {properties.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-sm font-medium text-slate-500">No properties in inventory. Click "Add Property" to begin.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-slate-500">
                  <thead className="bg-slate-50/60 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Property</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Agent</th>
                      <th className="px-6 py-4">Database</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {properties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-slate-50/40 transition-colors">
                        {/* Thumbnail & Title */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0 group/thumb cursor-pointer" onClick={() => {
                              setSelectedPreviewProperty(prop);
                              setPreviewImageIndex(0);
                            }} title="Click to view full image gallery">
                              <img
                                src={prop.imageUrl}
                                alt={prop.title}
                                className="h-12 w-16 rounded-lg object-cover bg-slate-100 border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                              {prop.additionalImages && prop.additionalImages.length > 0 && (
                                <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-sm shadow-xs flex items-center gap-0.5">
                                  <Images className="h-2.5 w-2.5" />
                                  <span>+{prop.additionalImages.length}</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 line-clamp-1">{prop.title}</div>
                              <div className="flex gap-1.5 items-center mt-0.5">
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 uppercase border border-slate-200/50">
                                  For {prop.type}
                                </span>
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  {prop.propertyType} • {prop.bedrooms}B / {prop.bathrooms}Ba
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-600 font-medium line-clamp-1 max-w-[180px]">
                            {prop.location}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4 font-bold text-blue-600">
                          {new Intl.NumberFormat('en-MY', {
                            style: 'currency',
                            currency: 'MYR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(prop.price).replace('MYR', 'RM')}
                          {prop.type === 'rent' && '/mo'}
                        </td>

                        {/* Status Dropdown */}
                        <td className="px-6 py-4">
                          <select
                            value={prop.status}
                            onChange={(e) => {
                              onUpdateProperty({
                                ...prop,
                                status: e.target.value as Property['status']
                              });
                            }}
                            className={`rounded-lg border px-2.5 py-1 text-xs font-bold cursor-pointer outline-hidden transition-all ${
                              prop.status === 'available'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                : prop.status === 'pending'
                                ? 'bg-blue-50 text-blue-700 border-blue-200/60'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <option value="available">Active</option>
                            <option value="pending">Pending</option>
                            <option value="sold">Sold</option>
                          </select>
                        </td>

                        {/* Agent */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={prop.agentPhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80'}
                              alt={prop.agentName}
                              className="h-6 w-6 rounded-full object-cover shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-xs font-semibold text-slate-700">{prop.agentName}</span>
                          </div>
                        </td>

                        {/* Database Sync Indicator */}
                        <td className="px-6 py-4">
                          {firebaseStatus === 'connected' ? (
                            <div className="flex items-center gap-1.5" title="Saved to Realtime Database">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]"></span>
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-600 tracking-wide">Live</span>
                            </div>
                          ) : firebaseStatus === 'offline' || firebaseStatus === 'error' ? (
                            <div className="flex items-center gap-1.5" title="Operating offline - will sync when back online">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)]"></span>
                              </span>
                              <span className="text-[10px] font-semibold text-amber-600 tracking-wide">Pending</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5" title="Saved to Local Browser Storage (configure Firebase secrets to persist in cloud!)">
                              <span className="relative flex h-2 w-2">
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]"></span>
                              </span>
                              <span className="text-[10px] font-semibold text-rose-500 tracking-wide">Local</span>
                            </div>
                          )}
                        </td>

                        {/* CRUD actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedPreviewProperty(prop);
                                setPreviewImageIndex(0);
                              }}
                              className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-750 transition-colors cursor-pointer"
                              title="View all pictures / gallery"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditForm(prop)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                              title="Edit listing details"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setPropertyToDelete(prop)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete listing"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeSubTab === 'inquiries' && (
          <motion.div
            key="inquiries-subtab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider font-bold">
                Historic Client Inquiries Queue
              </p>
              {inquiries.length > 0 && (
                <button
                  onClick={() => setIsClearInquiriesConfirmOpen(true)}
                  className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  Clear Queue History
                </button>
              )}
            </div>

            {inquiries.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                <Mail className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-500">No client inquiries received yet.</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">Inquiries submitted on property listings will automatically queue up here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={inq.propertyImage}
                          alt={inq.propertyTitle}
                          className="h-10 w-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Target Listing</div>
                          <div className="text-sm font-black text-slate-950 line-clamp-1">{inq.propertyTitle}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold font-mono shrink-0">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-800 uppercase border border-slate-200">
                          {inq.clientName.substring(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">{inq.clientName}</div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <a href={`mailto:${inq.clientEmail}`} className="text-xs text-slate-500 hover:text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                              <Mail className="h-3 w-3 text-slate-400" />
                              <span>{inq.clientEmail}</span>
                            </a>
                            <a href={`tel:${inq.clientPhone}`} className="text-xs text-slate-500 hover:text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{inq.clientPhone}</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700 leading-relaxed font-sans italic border border-slate-150 mt-1.5">
                        "{inq.message}"
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeSubTab === 'agent-profile' && (
          <motion.div
            key="agent-profile-subtab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto rounded-xl border border-slate-200 bg-white p-8 shadow-xs"
          >
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-sans text-lg font-black text-slate-900">My Agent Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Update your contact details and bio photo. Changes instantly sync to all existing and future listings.
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-6">
              {/* Profile Avatar & Photo Selector */}
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <div className="relative group shrink-0">
                  <img
                    src={profilePhoto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80'}
                    alt="Agent Profile"
                    className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md bg-slate-100"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 w-full space-y-3">
                  <label className="block text-xs font-bold text-slate-600">Profile Photo URL or Upload</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={profilePhoto}
                      onChange={(e) => setProfilePhoto(e.target.value)}
                      placeholder="Paste photo URL"
                      className="flex-1 rounded-lg border border-slate-250 bg-white px-3 py-1.5 text-xs focus:border-blue-500 text-slate-800 font-medium focus:outline-hidden"
                    />
                    <input
                      type="file"
                      id="profile-photo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressImageFile(file, 400, 400, 0.85);
                            setProfilePhoto(compressed);
                          } catch (err) {
                            console.error('Failed to compress profile photo:', err);
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('profile-photo-upload')?.click()}
                      className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3 py-1.5 cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Upload className="h-3.5 w-3.5 text-slate-450" />
                      <span>Upload</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-450 font-semibold">
                    Recommended: Square aspect ratio (1:1), e.g., 200x200px.
                  </p>
                </div>
              </div>

              {/* Form Input Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    Full Agent Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="e.g. Daniel Wan"
                    className="w-full rounded-lg border border-slate-250 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    Agent Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="e.g. +60 12-345 6789"
                    className="w-full rounded-lg border border-slate-250 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    Agent Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="e.g. wandaniel554@gmail.com"
                    className="w-full rounded-lg border border-slate-250 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden text-slate-800"
                  />
                </div>
              </div>

              {showSaveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 text-xs font-bold flex items-center gap-2"
                >
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Agent profile updated! All listings synced successfully.</span>
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-3 shadow-md shadow-blue-200 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4" />
                <span>Save Profile Settings</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-over Form Drawer (Create / Update Listing) */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 p-4 backdrop-blur-xs flex justify-end"
            onClick={() => setIsFormOpen(false)}
          >
            {/* Drawer Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="w-full max-w-2xl bg-white rounded-xl md:rounded-l-xl md:rounded-r-none p-6 shadow-2xl overflow-y-auto h-full flex flex-col border-l border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Form Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    Property Wizard
                  </span>
                  <h3 className="font-sans text-lg font-black text-slate-900">
                    {editingProperty ? `Edit Listing: ${editingProperty.title}` : 'Add New Listing'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer text-xs font-bold border border-slate-150"
                >
                  Close
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleFormSubmit} className="space-y-6 flex-1 pb-12">
                {/* Section 1: Basic Specifications */}
                <div className="space-y-3.5">
                  <h4 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
                    Basic Info
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Listing Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Modern Cliffside Mansion"
                      className="w-full rounded-lg border border-slate-250 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden transition-all placeholder:text-slate-400 text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Transaction Type *</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setType('sale')}
                          className={`rounded-lg py-2 text-xs font-bold border transition-all cursor-pointer ${
                            type === 'sale'
                              ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                              : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          For Sale
                        </button>
                        <button
                          type="button"
                          onClick={() => setType('rent')}
                          className={`rounded-lg py-2 text-xs font-bold border transition-all cursor-pointer ${
                            type === 'rent'
                              ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                              : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          For Rent
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Property Type *</label>
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value as Property['propertyType'])}
                        className="w-full rounded-lg border border-slate-250 bg-white px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden transition-all cursor-pointer text-slate-800 font-medium"
                      >
                        <option value="House">House</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Villa">Villa</option>
                        <option value="Townhouse">Townhouse</option>
                        <option value="Condo">Condo</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Price (RM) *</label>
                      <input
                        type="number"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder={type === 'rent' ? 'e.g. 3500' : 'e.g. 1200000'}
                        className="w-full rounded-lg border border-slate-250 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden transition-all text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Status *</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as Property['status'])}
                        className="w-full rounded-lg border border-slate-250 bg-white px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden transition-all cursor-pointer text-slate-800 font-medium"
                      >
                        <option value="available">Active</option>
                        <option value="pending">Pending</option>
                        <option value="sold">Sold</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Geographic Location *</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Malibu, California"
                      className="w-full rounded-lg border border-slate-250 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden transition-all placeholder:text-slate-400 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center justify-between">
                      <span>Specific Address (for Map Pin)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Jalan Kiara, Mont Kiara, 50480 Kuala Lumpur, Malaysia"
                      className="w-full rounded-lg border border-slate-250 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden transition-all placeholder:text-slate-400 text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Bedrooms</label>
                      <input
                        type="number"
                        step="1"
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full rounded-lg border border-slate-250 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Bathrooms</label>
                      <input
                        type="number"
                        step="0.5"
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        className="w-full rounded-lg border border-slate-250 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Sq Ft Area</label>
                      <input
                        type="number"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full rounded-lg border border-slate-250 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Description *</label>
                    <textarea
                      rows={4}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide comprehensive details about architectural layout, view quality, construction specifications, and special highlights..."
                      className="w-full rounded-lg border border-slate-250 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden transition-all resize-none text-slate-800"
                    />
                  </div>

                  {/* Featured Listing Toggle */}
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3.5 border border-slate-150">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="h-4 w-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="featured" className="text-xs font-bold text-slate-700 cursor-pointer selection:bg-transparent">
                      Feature on Home Banner (Prominently displays listing to customers)
                    </label>
                  </div>
                </div>

                {/* Section 2: Insert Pictures */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div>
                    <h4 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider pb-1">
                      Insert Pictures
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5 font-medium">
                      Upload local property photos, paste direct image URLs, or instantly select from our curated high-resolution real estate stock images library.
                    </p>
                  </div>

                  {/* Source Selector Tab */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setImageOption('preset')}
                      className={`rounded-md py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        imageOption === 'preset' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Presets (Stock)
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageOption('url')}
                      className={`rounded-md py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        imageOption === 'url' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Custom URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageOption('upload')}
                      className={`rounded-md py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        imageOption === 'upload' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Upload File
                    </button>
                  </div>

                  {/* Render option interface */}
                  {imageOption === 'preset' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-600">Select Curated Real Estate Presets</label>
                      <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-200 rounded-lg scrollbar-thin">
                        {PRESET_IMAGES.map((preset) => (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={() => setSelectedPresetUrl(preset.url)}
                            className={`relative aspect-16/10 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                              selectedPresetUrl === preset.url ? 'border-blue-600 scale-95 shadow-xs' : 'border-transparent opacity-75 hover:opacity-100'
                            }`}
                          >
                            <img src={preset.thumbnail} alt={preset.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                            {selectedPresetUrl === preset.url && (
                              <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center text-blue-600">
                                <Check className="h-4 w-4 drop-shadow-sm font-black" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50 aspect-21/9 relative">
                        <img src={selectedPresetUrl} alt="Selected stock" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute bottom-2 right-2 bg-slate-950/70 backdrop-blur-xs rounded-md px-2 py-0.5 text-[9px] text-white">Preview</div>
                      </div>
                    </div>
                  )}

                  {imageOption === 'url' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Direct Image URL</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={customImageUrl}
                            onChange={(e) => setCustomImageUrl(e.target.value)}
                            placeholder="https://example.com/property-photo.jpg"
                            className="flex-1 rounded-lg border border-slate-250 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden text-slate-800"
                          />
                        </div>
                      </div>
                      {customImageUrl && (
                        <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50 aspect-21/9 relative">
                          <img
                            src={customImageUrl}
                            alt="Custom url preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80';
                            }}
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute bottom-2 right-2 bg-slate-950/70 backdrop-blur-xs rounded-md px-2 py-0.5 text-[9px] text-white">Preview</div>
                        </div>
                      )}
                    </div>
                  )}

                  {imageOption === 'upload' && (
                    <div className="space-y-3">
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-32 ${
                          isDragging
                            ? 'border-blue-500 bg-blue-50/10'
                            : uploadedBase64
                            ? 'border-emerald-200 bg-emerald-50/10'
                            : 'border-slate-250 hover:border-slate-400 bg-slate-50/30'
                        }`}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        {uploadedBase64 ? (
                          <div className="flex flex-col items-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 mb-2">
                              <Check className="h-5 w-5" />
                            </div>
                            <p className="text-xs font-bold text-slate-800">Photo Prepared Successfully</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">Click or drag another file to replace</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-slate-400 mb-2" />
                            <p className="text-xs font-bold text-slate-800">Drag & Drop Image Here</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">Or click to browse files (Max 2MB)</p>
                          </>
                        )}
                      </div>

                      {uploadedBase64 && (
                        <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50 aspect-21/9 relative">
                          <img src={uploadedBase64} alt="Uploaded preview" className="w-full h-full object-cover" />
                          <div className="absolute bottom-2 right-2 bg-slate-950/70 backdrop-blur-xs rounded-md px-2 py-0.5 text-[9px] text-white">Base64 Encoded Preview</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Additional Pictures Management */}
                <div className="space-y-3.5 pt-4 border-t border-slate-200">
                  <div>
                    <h4 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider pb-1 flex items-center gap-1.5">
                      <Images className="h-3.5 w-3.5 text-blue-500" />
                      Additional Gallery Pictures ({additionalImages.length})
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                      Manage supplementary photos for the client's interactive walkthrough gallery.
                    </p>
                  </div>

                  {/* Additional Images Grid */}
                  {additionalImages.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-2 border border-slate-150 rounded-lg bg-slate-50/50">
                      {additionalImages.map((img, index) => (
                        <div key={index} className="relative aspect-16/10 rounded-md overflow-hidden group border border-slate-200 shadow-2xs">
                          <img src={img} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setAdditionalImages(additionalImages.filter((_, i) => i !== index));
                              }}
                              className="rounded bg-rose-600 hover:bg-rose-700 text-white p-1 shadow-md transition-colors cursor-pointer"
                              title="Remove Image"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="absolute bottom-1 right-1 bg-slate-900/80 rounded-xs px-1 text-[8px] font-bold text-white">
                            #{index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/30">
                      <p className="text-[11px] font-semibold text-slate-400">No additional images added yet.</p>
                    </div>
                  )}

                  {/* Inputs to Add Additional Images */}
                  <div className="space-y-2.5">
                    {/* URL Add */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Add Image via Custom URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={newAdditionalUrl}
                          onChange={(e) => setNewAdditionalUrl(e.target.value)}
                          placeholder="https://example.com/extra-photo.jpg"
                          className="flex-1 rounded-lg border border-slate-250 px-3 py-1.5 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const trimmed = newAdditionalUrl.trim();
                            if (trimmed) {
                              setAdditionalImages([...additionalImages, trimmed]);
                              setNewAdditionalUrl('');
                            } else {
                              alert('Please paste a valid image URL first.');
                            }
                          }}
                          className="rounded-lg bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs px-3.5 py-1.5 transition-colors cursor-pointer shrink-0"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>

                    {/* File Upload Add */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 text-left">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Add Image via File Upload</label>
                        <input
                          type="file"
                          ref={additionalFileInputRef}
                          onChange={handleAdditionalFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => additionalFileInputRef.current?.click()}
                          className="rounded-lg border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold text-xs px-3 py-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer w-full"
                        >
                          <Upload className="h-3.5 w-3.5 text-slate-400" />
                          <span>Upload Local Image File</span>
                        </button>
                      </div>

                      {/* Quick Presets selector */}
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Quick-Add Stock Presets</label>
                        <div className="flex items-center gap-1 overflow-x-auto border border-slate-200 rounded-lg p-1 max-h-9 scrollbar-none bg-white">
                          {PRESET_IMAGES.map((preset) => {
                            const isAlreadyAdded = additionalImages.includes(preset.url);
                            return (
                              <button
                                key={preset.url}
                                type="button"
                                onClick={() => {
                                  if (!isAlreadyAdded) {
                                    setAdditionalImages([...additionalImages, preset.url]);
                                  } else {
                                    alert('This preset is already in your gallery!');
                                  }
                                }}
                                className={`relative h-6 w-9 rounded-sm overflow-hidden border cursor-pointer shrink-0 transition-transform active:scale-90 ${
                                  isAlreadyAdded ? 'border-emerald-500 opacity-50' : 'border-slate-200 hover:border-slate-400'
                                }`}
                                title={`Click to add stock: ${preset.name}`}
                              >
                                <img src={preset.thumbnail} alt={preset.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Amenities Checklist */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div>
                    <h4 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider pb-1">
                      Check Amenities
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      Select which exclusive attributes apply to this luxury listing.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COMMON_AMENITIES.map((amenity) => {
                      const isChecked = selectedAmenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                              : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                            isChecked ? 'border-white bg-white text-slate-900' : 'border-slate-300 bg-white'
                          }`}>
                            {isChecked && <Check className="h-3 w-3" />}
                          </div>
                          <span className="truncate font-semibold">{amenity}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Amenity Tag */}
                  <div className="flex gap-2 max-w-sm pt-2">
                    <input
                      type="text"
                      placeholder="e.g. Private Marina"
                      value={customAmenity}
                      onChange={(e) => setCustomAmenity(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomAmenity())}
                      className="flex-1 rounded-lg border border-slate-250 px-3 py-1.5 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomAmenity}
                      className="rounded-lg bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs px-3 py-1.5 cursor-pointer"
                    >
                      Add Custom
                    </button>
                  </div>
                </div>

                {/* Section 4: Assign Agent (Read-only since it automatically inherits) */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div>
                    <h4 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider pb-1">
                      Listing Owner
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      This listing is automatically assigned to your personal agent profile.
                    </p>
                  </div>

                  <div className="flex items-center gap-3.5 rounded-lg bg-slate-50 p-4 border border-slate-200">
                    <img
                      src={agentProfile.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80'}
                      alt={agentProfile.name}
                      className="h-10 w-10 rounded-full object-cover bg-slate-150 border border-white shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-800">
                        {agentProfile.name}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {agentProfile.phone}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {agentProfile.email}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFormOpen(false);
                        setActiveSubTab('agent-profile');
                      }}
                      className="text-[10px] font-bold text-blue-600 hover:underline shrink-0"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>

                {/* Form CTA Actions */}
                <div className="flex gap-3 pt-6 border-t border-slate-200">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-3 shadow-md shadow-blue-200 hover:shadow-lg transition-all cursor-pointer"
                  >
                    {editingProperty ? 'Save Changes' : 'Publish Listing'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm px-6 py-3 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox / Gallery Viewer for Admin */}
      <AnimatePresence>
        {selectedPreviewProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 flex flex-col items-center justify-center p-4 backdrop-blur-md"
            onClick={() => setSelectedPreviewProperty(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPreviewProperty(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-colors cursor-pointer z-20 border border-white/10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Lightbox Content Container */}
            <div
              className="relative max-w-4xl w-full flex flex-col gap-4 items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Heading */}
              <div className="text-center text-white mb-2">
                <h3 className="font-sans text-lg font-black">{selectedPreviewProperty.title}</h3>
                <p className="text-xs text-slate-450 mt-1 font-semibold uppercase tracking-wider">
                  {selectedPreviewProperty.location}
                </p>
                <p className="text-xs text-slate-450 mt-0.5 font-medium">
                  Picture {previewImageIndex + 1} of {[selectedPreviewProperty.imageUrl, ...(selectedPreviewProperty.additionalImages || [])].length}
                </p>
              </div>

              {/* Main Image Stage */}
              <div className="relative aspect-16/10 w-full max-h-[60vh] rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl">
                <img
                  src={[selectedPreviewProperty.imageUrl, ...(selectedPreviewProperty.additionalImages || [])][previewImageIndex]}
                  alt="Gallery Preview"
                  className="max-h-[60vh] w-full object-contain"
                  referrerPolicy="no-referrer"
                />

                {/* Left/Right Navigation Arrows */}
                {[selectedPreviewProperty.imageUrl, ...(selectedPreviewProperty.additionalImages || [])].length > 1 && (
                  <>
                    <button
                      onClick={() => {
                        const list = [selectedPreviewProperty.imageUrl, ...(selectedPreviewProperty.additionalImages || [])];
                        setPreviewImageIndex((prev) => (prev - 1 + list.length) % list.length);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-950/65 hover:bg-slate-950/85 text-white rounded-full p-3 transition-colors cursor-pointer border border-white/10"
                    >
                      <ChevronRight className="h-5 w-5 rotate-180" />
                    </button>
                    <button
                      onClick={() => {
                        const list = [selectedPreviewProperty.imageUrl, ...(selectedPreviewProperty.additionalImages || [])];
                        setPreviewImageIndex((prev) => (prev + 1) % list.length);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-950/65 hover:bg-slate-950/85 text-white rounded-full p-3 transition-colors cursor-pointer border border-white/10"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails list */}
              <div className="flex gap-2 overflow-x-auto max-w-full pb-2 scrollbar-thin">
                {[selectedPreviewProperty.imageUrl, ...(selectedPreviewProperty.additionalImages || [])].map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPreviewImageIndex(idx)}
                    className={`relative aspect-16/10 w-20 shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      previewImageIndex === idx ? 'border-blue-500 scale-95 shadow-md' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Single Property Confirmation Modal */}
      <ConfirmModal
        isOpen={!!propertyToDelete}
        title="Delete Property Listing"
        subtitle="Permanent Database Action"
        message={`Are you sure you want to delete listing "${propertyToDelete?.title}"? This property and its gallery media will be permanently removed.`}
        confirmText="Delete Listing"
        cancelText="Keep Listing"
        variant="danger"
        iconType="trash"
        propertyPreview={propertyToDelete}
        onConfirm={() => {
          if (propertyToDelete) {
            onDeleteProperty(propertyToDelete.id);
            setPropertyToDelete(null);
          }
        }}
        onClose={() => setPropertyToDelete(null)}
      />

      {/* Clear Inquiries Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearInquiriesConfirmOpen}
        title="Clear Client Inquiries Queue"
        subtitle="Inbox Queue Cleanup"
        message="Are you sure you want to clear all historical client messages from your queue? This inquiry record history cannot be restored after clearing."
        confirmText="Clear Queue"
        cancelText="Keep Records"
        variant="danger"
        iconType="clear"
        countBadge={inquiries.length}
        onConfirm={() => {
          onClearInquiries();
          setIsClearInquiriesConfirmOpen(false);
        }}
        onClose={() => setIsClearInquiriesConfirmOpen(false)}
      />

      {/* Reset Database Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetDefaultConfirmOpen}
        title="Restore Default Sample Dataset"
        subtitle="Database Restore Warning"
        message="Are you sure you want to restore the listings database to the default pristine sample dataset? This will overwrite your current inventory modifications with the original sample properties."
        confirmText="Restore Sample Data"
        cancelText="Cancel"
        variant="warning"
        iconType="reset"
        onConfirm={() => {
          onResetToDefault();
          setIsResetDefaultConfirmOpen(false);
        }}
        onClose={() => setIsResetDefaultConfirmOpen(false)}
      />
    </div>
  );
}
