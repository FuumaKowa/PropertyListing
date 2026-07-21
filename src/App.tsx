import { useState, useMemo } from 'react';
import { useProperties } from './useProperties';
import { useInquiries } from './useInquiries';
import Navbar from './components/Navbar';
import PropertyCard from './components/PropertyCard';
import { Logo } from './components/Logo';
import PropertyDetailsModal from './components/PropertyDetailsModal';
import AdminPanel from './components/AdminPanel';
import { Property } from './types';
import {
  Search,
  SlidersHorizontal,
  Compass,
  RotateCcw,
  Sparkles,
  MapPin,
  DollarSign,
  ChevronRight,
  Info,
  Calendar,
  Building2,
  Phone,
  Mail,
  ArrowUpRight,
  Check,
  X,
  Bed,
  Bath,
  Maximize,
  Home,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const {
    properties,
    agentProfile,
    addProperty,
    updateProperty,
    deleteProperty,
    resetToDefault,
    updateAgentProfile,
    firebaseStatus,
    refreshing: refreshingProperties,
    refreshInventory
  } = useProperties();

  const {
    inquiries,
    addInquiry,
    clearInquiries,
    refreshInquiries,
    refreshing: refreshingInquiries
  } = useInquiries();

  // Navigation state
  const [activeTab, setActiveTab] = useState<'client' | 'admin'>('client');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Advanced Filters toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [transactionType, setTransactionType] = useState<'all' | 'sale' | 'rent'>('all');
  const [propertyType, setPropertyType] = useState<string>('all');
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('all');
  const [bathrooms, setBathrooms] = useState<string>('all');
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [minArea, setMinArea] = useState<string>('');
  const [maxArea, setMaxArea] = useState<string>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Reset Filters helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setTransactionType('all');
    setPropertyType('all');
    setSelectedPropertyTypes([]);
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('all');
    setBathrooms('all');
    setLocationQuery('');
    setMinArea('');
    setMaxArea('');
    setSelectedAmenities([]);
    setSortBy('newest');
  };

  // Toggle single property type in the advanced multi-select
  const handleTogglePropertyType = (type: string) => {
    setSelectedPropertyTypes((prev) => {
      let updated: string[];
      if (prev.includes(type)) {
        updated = prev.filter((t) => t !== type);
      } else {
        updated = [...prev, type];
      }
      
      // Update the legacy single dropdown state for compatibility
      if (updated.length === 1) {
        setPropertyType(updated[0]);
      } else {
        setPropertyType('all');
      }
      
      return updated;
    });
  };

  // Handle single dropdown change (keep in sync)
  const handlePropertyTypeDropdownChange = (val: string) => {
    setPropertyType(val);
    if (val === 'all') {
      setSelectedPropertyTypes([]);
    } else {
      setSelectedPropertyTypes([val]);
    }
  };

  // Extract unique locations/neighborhoods dynamically from property database
  const uniqueLocations = useMemo(() => {
    const locSet = new Set<string>();
    properties.forEach((p) => {
      if (p.location) {
        // e.g. "Beverly Crest, Los Angeles" -> extract parts
        const parts = p.location.split(',').map((s) => s.trim());
        parts.forEach((part) => {
          if (part && part.length > 1) {
            locSet.add(part);
          }
        });
      }
    });
    return Array.from(locSet).sort();
  }, [properties]);

  // Extract all unique amenities dynamically from property database
  const uniqueAmenities = useMemo(() => {
    const amenitySet = new Set<string>();
    properties.forEach((p) => {
      if (p.amenities) {
        p.amenities.forEach((a) => {
          if (a && a.trim()) {
            amenitySet.add(a.trim());
          }
        });
      }
    });
    return Array.from(amenitySet).sort();
  }, [properties]);

  // Extract counts for each property type
  const propertyTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    properties.forEach((p) => {
      counts[p.propertyType] = (counts[p.propertyType] || 0) + 1;
    });
    return counts;
  }, [properties]);

  // Filter & Sort Logic
  const filteredProperties = useMemo(() => {
    return properties
      .filter((prop) => {
        // Search text: match in title, description, or location
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchTitle = prop.title.toLowerCase().includes(query);
          const matchDesc = prop.description.toLowerCase().includes(query);
          const matchLoc = prop.location.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchLoc) return false;
        }

        // Transaction Type (Buy vs Rent)
        if (transactionType !== 'all' && prop.type !== transactionType) {
          return false;
        }

        // Property Type (Multi-select fallback to legacy single-select if array is empty)
        if (selectedPropertyTypes.length > 0) {
          if (!selectedPropertyTypes.includes(prop.propertyType)) {
            return false;
          }
        } else if (propertyType !== 'all' && prop.propertyType !== propertyType) {
          return false;
        }

        // Min Price
        if (minPrice && prop.price < parseFloat(minPrice)) {
          return false;
        }

        // Max Price
        if (maxPrice && prop.price > parseFloat(maxPrice)) {
          return false;
        }

        // Bedrooms
        if (bedrooms !== 'all') {
          if (bedrooms === '4+') {
            if (prop.bedrooms < 4) return false;
          } else if (prop.bedrooms !== parseInt(bedrooms)) {
            return false;
          }
        }

        // Bathrooms
        if (bathrooms !== 'all') {
          if (bathrooms === '3+') {
            if (prop.bathrooms < 3) return false;
          } else if (prop.bathrooms !== parseFloat(bathrooms)) {
            return false;
          }
        }

        // Location query
        if (locationQuery) {
          const loc = locationQuery.toLowerCase();
          if (!prop.location.toLowerCase().includes(loc)) return false;
        }

        // Min Area (sqft)
        if (minArea && prop.area < parseInt(minArea)) {
          return false;
        }

        // Max Area (sqft)
        if (maxArea && prop.area > parseInt(maxArea)) {
          return false;
        }

        // Amenities checklist (all checked amenities must exist in the property)
        if (selectedAmenities.length > 0) {
          const hasAll = selectedAmenities.every((amenity) => prop.amenities.includes(amenity));
          if (!hasAll) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'price-asc') {
          return a.price - b.price;
        }
        if (sortBy === 'price-desc') {
          return b.price - a.price;
        }
        if (sortBy === 'area-desc') {
          return b.area - a.area;
        }
        return 0;
      });
  }, [
    properties,
    searchQuery,
    transactionType,
    propertyType,
    selectedPropertyTypes,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    locationQuery,
    minArea,
    maxArea,
    selectedAmenities,
    sortBy
  ]);

  // Featured Properties list
  const featuredProperties = useMemo(() => {
    return properties.filter(p => p.featured && p.status === 'available');
  }, [properties]);

  // Active Filters Count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (transactionType !== 'all') count++;
    if (selectedPropertyTypes.length > 0) count += selectedPropertyTypes.length;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (bedrooms !== 'all') count++;
    if (bathrooms !== 'all') count++;
    if (locationQuery) count++;
    if (minArea) count++;
    if (maxArea) count++;
    if (selectedAmenities.length > 0) count += selectedAmenities.length;
    return count;
  }, [
    searchQuery,
    transactionType,
    selectedPropertyTypes,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    locationQuery,
    minArea,
    maxArea,
    selectedAmenities
  ]);

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top sticky Navbar */}
      <Navbar
        currentTab={activeTab}
        onChangeTab={setActiveTab}
        inquiryCount={inquiries.length}
      />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'client' ? (
            <motion.div
              key="client-portal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pb-16"
            >
              {/* Hero Banner Section */}
              <section className="relative bg-slate-950 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
                {/* Visual Accent Overlay */}
                <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center mix-blend-luminosity"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/40 z-0"></div>

                <div className="relative z-10 mx-auto max-w-4xl flex flex-col items-center">
                  {/* Premium indicator badge */}
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-300 backdrop-blur-md border border-blue-500/20 shadow-xs mb-6">
                    <Sparkles className="h-3.5 w-3.5 text-blue-400 fill-blue-400/20" />
                    <span>Primacy Real Estate Listings</span>
                  </div>

                  <h2 className="font-sans text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                    Find Your Signature Address.
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-3 leading-relaxed font-semibold">
                    A curated collection of exceptional residential properties offering refined architecture, bespoke craft, and prestigious environments.
                  </p>

                  {/* Quick search widget (Hero Bento Search) */}
                  <div className="w-full max-w-3xl mt-8 sm:mt-10 rounded-lg bg-white p-4 shadow-xl shadow-slate-200/50 border border-slate-200 flex flex-col md:flex-row items-stretch gap-3">
                    {/* Search Term */}
                    <div className="flex-1 relative flex items-center">
                      <Search className="absolute left-3.5 h-4 w-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search location, listing title or keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                      />
                    </div>

                    {/* Transaction type toggle */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setTransactionType('all')}
                        className={`flex-1 md:flex-none rounded-lg py-2 px-3 text-xs font-bold border transition-all cursor-pointer ${
                          transactionType === 'all'
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setTransactionType('sale')}
                        className={`flex-1 md:flex-none rounded-lg py-2 px-3 text-xs font-bold border transition-all cursor-pointer ${
                          transactionType === 'sale'
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => setTransactionType('rent')}
                        className={`flex-1 md:flex-none rounded-lg py-2 px-3 text-xs font-bold border transition-all cursor-pointer ${
                          transactionType === 'rent'
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Rent
                      </button>
                    </div>

                    {/* Quick Trigger Button */}
                    <button
                      onClick={() => {
                        const target = document.getElementById('listings-catalog');
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-5 shadow-md shadow-blue-200 hover:shadow-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Explore Portal</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </section>

              {/* Featured Properties Slider Block */}
              {featuredProperties.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                    <div>
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Top Selections
                      </span>
                      <h3 className="font-sans text-xl font-bold tracking-tight text-slate-900 mt-0.5 flex items-center gap-1.5">
                        <Sparkles className="h-4.5 w-4.5 text-blue-600 fill-blue-100" />
                        Featured Listings
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featuredProperties.slice(0, 3).map((prop) => (
                      <div
                        key={`featured-${prop.id}`}
                        onClick={() => setSelectedProperty(prop)}
                        className="relative aspect-16/10 rounded-lg overflow-hidden group cursor-pointer border border-slate-200 bg-slate-950 shadow-md hover:shadow-xl hover:border-slate-300 transition-all duration-300"
                      >
                        {/* Img background */}
                        <img
                          src={prop.imageUrl}
                          alt={prop.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>

                        {/* Badges top */}
                        <div className="absolute top-4 left-4 z-10 flex gap-1.5">
                          <span className="inline-flex items-center rounded bg-blue-600 px-2 py-0.5 text-[9px] font-bold text-white tracking-wide uppercase shadow-sm">
                            Featured
                          </span>
                          <span className="inline-flex items-center rounded bg-white/95 px-2 py-0.5 text-[9px] font-bold text-slate-800 shadow-sm uppercase">
                            For {prop.type}
                          </span>
                        </div>

                        {/* Price & info bottom */}
                        <div className="absolute bottom-4 left-4 right-4 text-white z-10 flex items-end justify-between">
                          <div>
                            <div className="font-mono text-[10px] uppercase text-slate-300 tracking-wider flex items-center gap-1 font-bold">
                              <MapPin className="h-3 w-3" />
                              {prop.location.split(',')[0]}
                            </div>
                            <h4 className="font-sans text-base font-bold tracking-tight text-white mt-0.5 line-clamp-1 font-bold">
                              {prop.title}
                            </h4>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-sans text-lg font-extrabold text-white">
                              {new Intl.NumberFormat('en-MY', {
                                style: 'currency',
                                currency: 'MYR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                              }).format(prop.price)}
                              {prop.type === 'rent' && '/mo'}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-300 justify-end mt-0.5 font-semibold">
                              <span>Details</span>
                              <ArrowUpRight className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Main Directory Catalog */}
              <section id="listings-catalog" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 scroll-mt-20">
                {/* Filters Header bar */}
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-sans text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>Property Showcase</span>
                        {activeFiltersCount > 0 && (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                            {activeFiltersCount} Active
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        Displaying {filteredProperties.length} refined properties matching your guidelines.
                      </p>
                    </div>

                    {/* Filter and reset actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`rounded-lg border px-3.5 py-2 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                          showAdvanced || activeFiltersCount > 0
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50'
                        }`}
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        <span>Advanced Filters</span>
                        {activeFiltersCount > 0 && (
                          <span className="h-2 w-2 rounded-full bg-blue-300 animate-pulse" />
                        )}
                      </button>

                      <button
                        onClick={handleResetFilters}
                        className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 font-bold text-xs py-2 px-3.5 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Clear active filters"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Reset</span>
                      </button>
                    </div>
                  </div>

                  {/* Transaction Mode Tabs (Buy vs Rent Selector) */}
                  <div className="flex border-b border-slate-200 -mb-[1px] overflow-x-auto scrollbar-none">
                    <button
                      onClick={() => setTransactionType('all')}
                      className={`py-3 px-5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                        transactionType === 'all'
                          ? 'border-blue-600 text-blue-600 font-extrabold'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Building2 className="h-4 w-4" />
                      <span>All Listings</span>
                    </button>
                    <button
                      onClick={() => setTransactionType('sale')}
                      className={`py-3 px-5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                        transactionType === 'sale'
                          ? 'border-blue-600 text-blue-600 font-extrabold'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Home className="h-4 w-4" />
                      <span>Buy a House (For Sale)</span>
                    </button>
                    <button
                      onClick={() => setTransactionType('rent')}
                      className={`py-3 px-5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                        transactionType === 'rent'
                          ? 'border-blue-600 text-blue-600 font-extrabold'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Key className="h-4 w-4" />
                      <span>Rent a House (To Rent)</span>
                    </button>
                  </div>

                  {/* Flat Simple Filters Toolbar */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 bg-slate-100/70 p-2 rounded-lg border border-slate-200">
                    {/* Search Field */}
                    <div className="relative flex items-center sm:col-span-2">
                      <Search className="absolute left-3.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by keywords, title, location, or descriptive terms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg bg-white border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden text-slate-800 font-medium"
                      />
                    </div>

                    {/* Purpose selection */}
                    <select
                      value={transactionType}
                      onChange={(e) => setTransactionType(e.target.value as 'all' | 'sale' | 'rent')}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-500 cursor-pointer text-slate-700 font-bold"
                    >
                      <option value="all">Purpose: Buy & Rent</option>
                      <option value="sale">Buying a House</option>
                      <option value="rent">Renting a House</option>
                    </select>

                    {/* Property type */}
                    <select
                      value={propertyType}
                      onChange={(e) => handlePropertyTypeDropdownChange(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-500 cursor-pointer text-slate-700 font-bold"
                    >
                      <option value="all">All Properties</option>
                      <option value="House">Houses</option>
                      <option value="Apartment">Apartments</option>
                      <option value="Villa">Villas</option>
                      <option value="Townhouse">Townhouses</option>
                      <option value="Condo">Condominiums</option>
                      <option value="Commercial">Commercial</option>
                    </select>

                    {/* Sort controls */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-500 cursor-pointer text-slate-700 font-bold"
                    >
                      <option value="newest">Sort: Newest First</option>
                      <option value="price-asc">Sort: Price (Low to High)</option>
                      <option value="price-desc">Sort: Price (High to Low)</option>
                      <option value="area-desc">Sort: Size (Large to Small)</option>
                    </select>
                  </div>

                  {/* Active Filter Pills/Tags (Click to clear individual filter) */}
                  {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mr-1">Active:</span>
                      
                      {/* Search query tag */}
                      {searchQuery && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 border border-slate-200">
                          <span>Search: "{searchQuery}"</span>
                          <button onClick={() => setSearchQuery('')} className="hover:text-blue-600 focus:outline-hidden cursor-pointer">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )}

                      {/* Transaction type tag */}
                      {transactionType !== 'all' && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                          <span>For {transactionType}</span>
                          <button onClick={() => setTransactionType('all')} className="hover:text-blue-900 focus:outline-hidden cursor-pointer">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )}

                      {/* Property Type individual tags */}
                      {selectedPropertyTypes.map((type) => (
                        <span key={`pill-type-${type}`} className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200">
                          <span>{type}</span>
                          <button onClick={() => handleTogglePropertyType(type)} className="hover:text-indigo-900 focus:outline-hidden cursor-pointer">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}

                      {/* Price Range tag */}
                      {(minPrice || maxPrice) && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                          <span>
                            {minPrice && !maxPrice && `Min: RM ${parseInt(minPrice).toLocaleString()}`}
                            {!minPrice && maxPrice && `Max: RM ${parseInt(maxPrice).toLocaleString()}`}
                            {minPrice && maxPrice && `RM ${parseInt(minPrice).toLocaleString()} - RM ${parseInt(maxPrice).toLocaleString()}`}
                          </span>
                          <button
                            onClick={() => {
                              setMinPrice('');
                              setMaxPrice('');
                            }}
                            className="hover:text-emerald-900 focus:outline-hidden cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )}

                      {/* Bedrooms tag */}
                      {bedrooms !== 'all' && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                          <span>{bedrooms === '4+' ? '4+ Beds' : `${bedrooms} ${parseInt(bedrooms) === 1 ? 'Bed' : 'Beds'}`}</span>
                          <button onClick={() => setBedrooms('all')} className="hover:text-amber-900 focus:outline-hidden cursor-pointer">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )}

                      {/* Bathrooms tag */}
                      {bathrooms !== 'all' && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700 border border-purple-200">
                          <span>{bathrooms === '3+' ? '3+ Baths' : `${bathrooms} ${parseFloat(bathrooms) === 1 ? 'Bath' : 'Baths'}`}</span>
                          <button onClick={() => setBathrooms('all')} className="hover:text-purple-900 focus:outline-hidden cursor-pointer">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )}

                      {/* Location query tag */}
                      {locationQuery && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700 border border-sky-200">
                          <span>In: {locationQuery}</span>
                          <button onClick={() => setLocationQuery('')} className="hover:text-sky-900 focus:outline-hidden cursor-pointer">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )}

                      {/* Area range tag */}
                      {(minArea || maxArea) && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
                          <span>
                            {minArea && !maxArea && `Min: ${parseInt(minArea).toLocaleString()} sqft`}
                            {!minArea && maxArea && `Max: ${parseInt(maxArea).toLocaleString()} sqft`}
                            {minArea && maxArea && `${parseInt(minArea).toLocaleString()} - ${parseInt(maxArea).toLocaleString()} sqft`}
                          </span>
                          <button
                            onClick={() => {
                              setMinArea('');
                              setMaxArea('');
                            }}
                            className="hover:text-rose-900 focus:outline-hidden cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )}

                      {/* Amenities checklist individual tags */}
                      {selectedAmenities.map((amenity) => (
                        <span key={`pill-amenity-${amenity}`} className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700 border border-teal-200">
                          <span>{amenity}</span>
                          <button
                            onClick={() => setSelectedAmenities((prev) => prev.filter((a) => a !== amenity))}
                            className="hover:text-teal-900 focus:outline-hidden cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}

                      {/* Reset all button inside active tag bar */}
                      <button
                        onClick={handleResetFilters}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline uppercase tracking-wider ml-1 hover:no-underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  )}

                  {/* Advanced Collapsible Filters */}
                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28, ease: 'easeInOut' }}
                        className="overflow-hidden bg-white border border-slate-200 rounded-xl p-4 sm:p-6 mt-1 shadow-md"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                          
                          {/* 1. Location & Neighborhood Suggestions (Col span 4) */}
                          <div className="md:col-span-4 flex flex-col gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-blue-600" />
                                Neighborhood or City
                              </label>
                              <input
                                type="text"
                                placeholder="Type city, state, zip or region..."
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 font-semibold text-slate-800 bg-slate-50/50"
                              />
                            </div>
                            
                            {/* Dynamic Suggestion Chips */}
                            {uniqueLocations.length > 0 && (
                              <div>
                                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  Quick Suggestions:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {uniqueLocations.slice(0, 6).map((loc) => {
                                    const isSelected = locationQuery.toLowerCase() === loc.toLowerCase();
                                    return (
                                      <button
                                        key={`loc-sugg-${loc}`}
                                        onClick={() => setLocationQuery(isSelected ? '' : loc)}
                                        className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-all cursor-pointer ${
                                          isSelected
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/40'
                                        }`}
                                      >
                                        {loc}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 2. Budget/Price Range Planner (Col span 4) */}
                          <div className="md:col-span-4 flex flex-col gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                                Budget Planner
                              </label>
                              <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                  <span className="absolute left-2 text-slate-400 text-[10px] top-1/2 -translate-y-1/2 font-bold">RM</span>
                                  <input
                                    type="number"
                                    placeholder="Min Price"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 pl-8 pr-2 py-2 text-xs focus:border-blue-500 font-semibold text-slate-800 bg-slate-50/50"
                                  />
                                </div>
                                <span className="text-slate-400 text-xs font-bold">to</span>
                                <div className="relative flex-1">
                                  <span className="absolute left-2 text-slate-400 text-[10px] top-1/2 -translate-y-1/2 font-bold">RM</span>
                                  <input
                                    type="number"
                                    placeholder="Max Price"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 pl-8 pr-2 py-2 text-xs focus:border-blue-500 font-semibold text-slate-800 bg-slate-50/50"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Quick Price Range Presets depending on transactionType */}
                            <div>
                              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Quick Price Presets:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {(transactionType === 'rent'
                                  ? [
                                      { label: 'Under RM 3k', min: '', max: '3000' },
                                      { label: 'RM 3k - 5k', min: '3000', max: '5000' },
                                      { label: 'RM 5k - 10k', min: '5000', max: '10000' },
                                      { label: 'RM 10k+', min: '10000', max: '' }
                                    ]
                                  : [
                                      { label: 'Under RM 1M', min: '', max: '1000000' },
                                      { label: 'RM 1M - 3M', min: '1000000', max: '3000000' },
                                      { label: 'RM 3M - 6M', min: '3000000', max: '6000000' },
                                      { label: 'RM 6M+', min: '6000000', max: '' }
                                    ]
                                ).map((preset) => {
                                  const isSelected = minPrice === preset.min && maxPrice === preset.max;
                                  return (
                                    <button
                                      key={`preset-price-${preset.label}`}
                                      onClick={() => {
                                        if (isSelected) {
                                          setMinPrice('');
                                          setMaxPrice('');
                                        } else {
                                          setMinPrice(preset.min);
                                          setMaxPrice(preset.max);
                                        }
                                      }}
                                      className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/40'
                                      }`}
                                    >
                                      {preset.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* 3. Layout & Dimensions Segmented Controls (Col span 4) */}
                          <div className="md:col-span-4 flex flex-col gap-3">
                            {/* Bed Segmented Selector */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                <Bed className="h-3.5 w-3.5 text-amber-600" />
                                Bedrooms
                              </label>
                              <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/60">
                                {[
                                  { val: 'all', label: 'Any' },
                                  { val: '1', label: '1' },
                                  { val: '2', label: '2' },
                                  { val: '3', label: '3' },
                                  { val: '4+', label: '4+' }
                                ].map((item) => (
                                  <button
                                    key={`bed-btn-${item.val}`}
                                    onClick={() => setBedrooms(item.val)}
                                    className={`rounded-md py-1.5 text-xs font-bold text-center transition-all cursor-pointer ${
                                      bedrooms === item.val
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                  >
                                    {item.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Bath Segmented Selector */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                <Bath className="h-3.5 w-3.5 text-purple-600" />
                                Bathrooms
                              </label>
                              <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/60">
                                {[
                                  { val: 'all', label: 'Any' },
                                  { val: '1', label: '1' },
                                  { val: '2', label: '2' },
                                  { val: '3+', label: '3+' }
                                ].map((item) => (
                                  <button
                                    key={`bath-btn-${item.val}`}
                                    onClick={() => setBathrooms(item.val)}
                                    className={`rounded-md py-1.5 text-xs font-bold text-center transition-all cursor-pointer ${
                                      bathrooms === item.val
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                  >
                                    {item.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Expandable row: Property types multi-select & Amenities & Size (sqft) */}
                        <div className="border-t border-slate-100 mt-5 pt-5 grid grid-cols-1 md:grid-cols-12 gap-6">
                          
                          {/* Dimensions Area (Col span 4) */}
                          <div className="md:col-span-4 flex flex-col gap-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <Maximize className="h-3.5 w-3.5 text-rose-600" />
                              Property Size Threshold
                            </label>
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  placeholder="Min sqft"
                                  value={minArea}
                                  onChange={(e) => setMinArea(e.target.value)}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 font-semibold text-slate-800 bg-slate-50/50"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 uppercase">sqft</span>
                              </div>
                              <span className="text-slate-400 text-xs font-bold">to</span>
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  placeholder="Max sqft"
                                  value={maxArea}
                                  onChange={(e) => setMaxArea(e.target.value)}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 font-semibold text-slate-800 bg-slate-50/50"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 uppercase">sqft</span>
                              </div>
                            </div>
                          </div>

                          {/* Property Types checkboxes/chips (Col span 4) */}
                          <div className="md:col-span-4 flex flex-col gap-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-slate-600" />
                              Property Types Selection
                            </label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {['House', 'Apartment', 'Villa', 'Townhouse', 'Condo', 'Commercial'].map((type) => {
                                const isSelected = selectedPropertyTypes.includes(type);
                                const count = propertyTypeCounts[type] || 0;
                                return (
                                  <button
                                    key={`type-chip-${type}`}
                                    onClick={() => handleTogglePropertyType(type)}
                                    className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold border transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-xs'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      {isSelected ? (
                                        <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                                      ) : (
                                        <div className="h-3.5 w-3.5 rounded border border-slate-300 shrink-0" />
                                      )}
                                      <span>{type}</span>
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-400">({count})</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Dynamic Amenities (Col span 4) */}
                          <div className="md:col-span-4 flex flex-col gap-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                              Desired Amenities
                            </label>
                            <div className="max-h-24 overflow-y-auto border border-slate-200/80 rounded-lg p-2.5 bg-slate-50/50 flex flex-wrap gap-1.5">
                              {uniqueAmenities.map((amenity) => {
                                const isSelected = selectedAmenities.includes(amenity);
                                return (
                                  <button
                                    key={`amenity-chip-${amenity}`}
                                    onClick={() => {
                                      setSelectedAmenities((prev) => {
                                        if (prev.includes(amenity)) {
                                          return prev.filter((a) => a !== amenity);
                                        } else {
                                          return [...prev, amenity];
                                        }
                                      });
                                    }}
                                    className={`rounded-md px-2 py-1 text-[10px] font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                                      isSelected
                                        ? 'bg-teal-50 border-teal-300 text-teal-700 font-bold'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    {isSelected && <Check className="h-3 w-3 text-teal-600 shrink-0" />}
                                    <span>{amenity}</span>
                                  </button>
                                );
                              })}
                              {uniqueAmenities.length === 0 && (
                                <span className="text-slate-400 text-[10px]">No amenities loaded.</span>
                              )}
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Listings Grid */}
                {filteredProperties.length === 0 ? (
                  <div className="text-center py-20 px-4 rounded-lg border border-slate-200 bg-white max-w-md mx-auto p-8 shadow-xs">
                    <Compass className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <h4 className="font-sans text-base font-bold text-slate-900 font-black">No Matching Listings</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed font-medium">
                      We couldn't find any properties matching your selected query parameters. Try modifying your search or resetting all active filters.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 shadow-md shadow-blue-200 transition-all cursor-pointer"
                    >
                      Clear Search Parameters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProperties.map((prop) => (
                      <PropertyCard
                        key={prop.id}
                        property={prop}
                        onSelect={setSelectedProperty}
                      />
                    ))}
                  </div>
                )}
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="admin-portal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Admin Panel Component */}
              <AdminPanel
                properties={properties}
                agentProfile={agentProfile}
                onUpdateAgentProfile={updateAgentProfile}
                inquiries={inquiries}
                onAddProperty={addProperty}
                onUpdateProperty={updateProperty}
                onDeleteProperty={deleteProperty}
                onResetToDefault={resetToDefault}
                onClearInquiries={clearInquiries}
                firebaseStatus={firebaseStatus}
                isRefreshing={refreshingProperties || refreshingInquiries}
                onRefresh={async () => {
                  await Promise.all([refreshInventory(), refreshInquiries()]);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Property Details Modal */}
      <AnimatePresence>
        {selectedProperty && (
          <PropertyDetailsModal
            property={selectedProperty}
            onClose={() => setSelectedProperty(null)}
            onSendInquiry={addInquiry}
          />
        )}
      </AnimatePresence>

      {/* Footer Section */}
      <footer className="border-t border-slate-200 bg-white py-12 text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-auto" showText={true} />
          </div>

          <p className="font-sans text-xs text-slate-400 font-medium">
            © 2026 Nilai Harta Consultant Sdn Bhd. Property Listings Portal. All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-xs font-bold text-slate-500">
            <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setActiveTab('client')}>Client Search</span>
            <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setActiveTab('admin')}>Agent Access</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
