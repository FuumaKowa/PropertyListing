import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { X, Bed, Bath, Maximize, MapPin, Phone, Mail, Check, MessageSquare, Send, Calendar, Compass, ZoomIn, ZoomOut, Navigation, Layers } from 'lucide-react';
import { Property } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface PropertyDetailsModalProps {
  property: Property;
  onClose: () => void;
  onSendInquiry: (inquiry: {
    propertyId: string;
    propertyTitle: string;
    propertyImage: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    message: string;
  }) => void;
}

function formatWhatsAppNumber(phone: string): string {
  // Remove all non-numeric characters
  let digits = phone.replace(/\D/g, '');
  
  // If it starts with 0, convert to Malaysian international code 60
  if (digits.startsWith('0')) {
    digits = '60' + digits.substring(1);
  }
  
  // If it doesn't have country code (e.g., just '1119602980'), prepend '60'
  if (digits.startsWith('1') && (digits.length === 9 || digits.length === 10 || digits.length === 11)) {
    digits = '60' + digits;
  }
  
  return digits;
}

export default function PropertyDetailsModal({ property, onClose, onSendInquiry }: PropertyDetailsModalProps) {
  const [activeImage, setActiveImage] = useState(property.imageUrl);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [message, setMessage] = useState(`Hi, I am interested in "${property.title}" and would like to schedule a viewing or request more details. Thank you!`);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(15);
  const [mapMode, setMapMode] = useState<'street' | 'satellite'>('street');

  const imagesList = [property.imageUrl, ...(property.additionalImages || [])];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!clientName || !clientEmail || !clientPhone) {
      setFormError('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);

    // Simulate sending inquiry
    setTimeout(() => {
      onSendInquiry({
        propertyId: property.id,
        propertyTitle: property.title,
        propertyImage: property.imageUrl,
        clientName,
        clientEmail,
        clientPhone,
        message,
      });
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const formatPrice = (price: number, type: 'sale' | 'rent') => {
    const formatted = new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
    return type === 'rent' ? `${formatted}/mo` : formatted;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xs overflow-y-auto"
    >
      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative w-full max-w-5xl rounded-xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Title & Close) */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 sticky top-0 bg-white z-20">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Listing Details • For {property.type}
            </span>
            <h2 className="font-sans text-lg sm:text-xl font-black text-slate-900 leading-tight">
              {property.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (Images, Description, Amenities) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Main Interactive Viewer */}
            <div className="relative aspect-16/10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={activeImage}
                alt={property.title}
                className="w-full h-full object-cover transition-opacity duration-300"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-3 left-3 rounded bg-slate-950/80 backdrop-blur-xs px-3 py-1 text-xs font-bold text-white shadow-xs">
                {property.propertyType}
              </span>
            </div>

            {/* Thumbnail Navigation */}
            {imagesList.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative aspect-16/10 w-20 shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      activeImage === img ? 'border-blue-600 scale-95 shadow-xs' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}

            {/* Details and Description */}
            <div>
              <h3 className="font-sans text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Property Description
              </h3>
              <p className="font-sans text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div>
              <h3 className="font-sans text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Key Amenities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-800 border border-slate-150"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>            {/* Real Free Dynamic Google Map */}
            <div>
              <h3 className="font-sans text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Property Location
              </h3>
              <div className="flex items-start gap-2 text-slate-500 text-sm mb-3">
                <MapPin className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">{property.address || property.location}</p>
                  {property.address && <p className="text-xs text-slate-500 mt-0.5">{property.location}</p>}
                </div>
              </div>
              
              <div className="relative h-64 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-xs">
                {/* Mode Toggles */}
                <div className="absolute top-3 left-3 flex gap-1 z-20">
                  <button
                    type="button"
                    onClick={() => setMapMode('street')}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border ${
                      mapMode === 'street'
                        ? 'bg-blue-600 border-blue-600 text-white font-black'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Map</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapMode('satellite')}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border ${
                      mapMode === 'satellite'
                        ? 'bg-blue-600 border-blue-600 text-white font-black'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Satellite</span>
                  </button>
                </div>

                {/* Top-Right Controls: Directions */}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.title}, ${property.address || property.location}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg shadow-xs flex items-center justify-center border border-slate-200 transition-all cursor-pointer"
                    title="Open in Google Maps"
                  >
                    <Navigation className="h-4 w-4" />
                  </a>
                </div>

                {/* Bottom-Right Controls: Zoom */}
                <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-20">
                  <button
                    type="button"
                    onClick={() => setZoom(prev => Math.min(prev + 1, 20))}
                    className="h-8 w-8 bg-white hover:bg-slate-50 text-slate-600 rounded-lg shadow-xs flex items-center justify-center border border-slate-200 transition-all cursor-pointer font-bold"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(prev => Math.max(prev - 1, 10))}
                    className="h-8 w-8 bg-white hover:bg-slate-50 text-slate-600 rounded-lg shadow-xs flex items-center justify-center border border-slate-200 transition-all cursor-pointer font-bold"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                </div>

                {/* Live iframe Map embed (Completely Free, Zero-Cost, Keyless) */}
                <iframe
                  title="Property Location Map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address || property.location)}&t=${mapMode === 'satellite' ? 'k' : 'm'}&z=${zoom}&output=embed`}
                  allowFullScreen
                  loading="lazy"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar: Summary Box, Agent & Contact Form) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Key Summary Panel */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-5">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">Listing Price</span>
              <div className="font-sans text-2xl sm:text-3xl font-black text-blue-600 mt-1 mb-4">
                {formatPrice(property.price, property.type)}
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-slate-200 pt-4 text-center">
                <div className="flex flex-col items-center p-2 rounded-lg bg-white border border-slate-200">
                  <Bed className="h-4 w-4 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-800">{property.bedrooms}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Beds</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-white border border-slate-200">
                  <Bath className="h-4 w-4 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-800">{property.bathrooms}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Baths</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-white border border-slate-200">
                  <Maximize className="h-4 w-4 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-800">{property.area.toLocaleString()}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Sq Ft</span>
                </div>
              </div>
            </div>

            {/* Agent Profile Detail */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
              <h4 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Listing Agent
              </h4>
              <div className="flex items-center gap-4">
                <img
                  src={property.agentPhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80'}
                  alt={property.agentName}
                  className="h-12 w-12 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h5 className="font-sans text-sm font-bold text-slate-800">{property.agentName}</h5>
                  <p className="text-xs text-slate-400 font-semibold">Senior Property Advisor</p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5 border-t border-slate-200 pt-4">
                <a
                  href={`https://wa.me/${formatWhatsAppNumber(property.agentPhone)}?text=${encodeURIComponent(
                    `Hi, I am interested in your property listing: "${property.title}". Could you please provide more information?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-emerald-600 transition-colors font-bold cursor-pointer"
                  title="Click to chat on WhatsApp"
                >
                  <svg className="h-3.5 w-3.5 text-emerald-500 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.62.963 3.41 1.47 5.258 1.471 5.483 0 9.946-4.461 9.949-9.949.002-2.659-1.023-5.159-2.884-7.022C17.056 1.8 14.562.775 11.903.775c-5.485 0-9.948 4.462-9.952 9.95-.001 1.838.48 3.633 1.393 5.215L2.24 21.841l6.19-1.623zM16.821 14c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.58.13-.17.26-.66.85-.81 1.02-.15.17-.3.19-.56.06-.26-.13-1.1-.41-2.1-1.3-1.1-.98-1.54-1.6-1.76-1.97-.22-.37-.02-.57.11-.7.12-.11.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.4-.79-1.91-.21-.51-.43-.44-.58-.45-.15-.01-.33-.01-.5-.01-.17 0-.44.06-.68.32-.24.26-.91.89-.91 2.17 0 1.28.93 2.51 1.06 2.68.13.17 1.83 2.8 4.44 3.93.62.27 1.11.43 1.49.55.62.2 1.19.17 1.64.1.5-.07 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.11-.26-.17-.52-.3z" />
                  </svg>
                  <span>{property.agentPhone}</span>
                  <span className="text-[10px] text-emerald-600 font-black ml-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wide">WhatsApp</span>
                </a>
                <a
                  href={`mailto:${property.agentEmail}`}
                  className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-blue-600 transition-colors font-semibold"
                >
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{property.agentEmail}</span>
                </a>
              </div>
            </div>

            {/* Direct Contact Form */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
              <h4 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Request Information
              </h4>

              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="contact-form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-3.5"
                  >
                    {formError && (
                      <div className="rounded-lg bg-rose-50 border border-rose-200/80 p-2.5 text-xs font-semibold text-rose-700">
                        {formError}
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-lg border border-slate-250 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden transition-all placeholder:text-slate-400 text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Email *</label>
                        <input
                          type="email"
                          required
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="john@example.com"
                          className="w-full rounded-lg border border-slate-250 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden transition-all placeholder:text-slate-400 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Phone *</label>
                        <input
                          type="tel"
                          required
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="w-full rounded-lg border border-slate-250 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden transition-all placeholder:text-slate-400 text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Message</label>
                      <textarea
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full rounded-lg border border-slate-250 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden transition-all resize-none text-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 px-4 shadow-md shadow-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Contact Agent</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success-message"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6 px-4 rounded-lg bg-emerald-50 border border-emerald-200/60 flex flex-col items-center"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 mb-3 shadow-xs">
                      <Check className="h-6 w-6" />
                    </div>
                    <h5 className="font-sans text-sm font-bold text-slate-900">Inquiry Received</h5>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-xs">
                      Thank you! Your message has been routed to <strong>{property.agentName}</strong>. They will contact you shortly via email or phone.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                    >
                      Send another message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
