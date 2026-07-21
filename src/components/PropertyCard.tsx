import React from 'react';
import { Bed, Bath, Maximize, MapPin, Tag } from 'lucide-react';
import { Property } from '../types';
import { motion } from 'motion/react';

interface PropertyCardProps {
  key?: string;
  property: Property;
  onSelect: (property: Property) => void;
}

export default function PropertyCard({ property, onSelect }: PropertyCardProps) {
  // Format price helper
  const formatPrice = (price: number, type: 'sale' | 'rent') => {
    const formatted = new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
    return type === 'rent' ? `${formatted}/mo` : formatted;
  };

  // Status style helper
  const getStatusBadge = (status: 'available' | 'pending' | 'sold') => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider border border-emerald-200/50">
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider border border-blue-200/50">
            Pending
          </span>
        );
      case 'sold':
        return (
          <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-200">
            Sold
          </span>
        );
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300"
    >
      {/* Property Image & Badges */}
      <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Absolute tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold text-white tracking-wide uppercase shadow-sm ${
            property.type === 'sale' ? 'bg-slate-950' : 'bg-blue-600'
          }`}>
            For {property.type}
          </span>
          <span className="inline-flex items-center rounded bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-sm border border-slate-200">
            {property.propertyType}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-xs rounded-md p-0.5 shadow-xs border border-slate-200/50">
          {getStatusBadge(property.status)}
        </div>
      </div>

      {/* Property Details */}
      <div className="flex flex-1 flex-col p-5">
        {/* Price & Status */}
        <div className="flex items-baseline justify-between mb-2">
          <span className="font-sans text-xl font-black tracking-tight text-blue-600">
            {formatPrice(property.price, property.type)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-sans text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-slate-400 text-xs mb-4">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="line-clamp-1 text-slate-500 font-medium">{property.location}</span>
        </div>

        {/* Features Row */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-slate-500">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">{property.area.toLocaleString()} sqft</span>
          </div>
        </div>

        {/* View Details Button */}
        <button
          onClick={() => onSelect(property)}
          className="mt-4 w-full flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-150 px-4 py-2 text-xs font-bold text-slate-700 transition-all duration-200 cursor-pointer"
        >
          Explore Listing
        </button>
      </div>
    </motion.div>
  );
}
