import { Property } from './types';

export const PRESET_IMAGES = [
  {
    name: 'Modern Luxury Villa',
    url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Elegant Family Estate',
    url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Contemporary Penthouse',
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Sleek Urban Apartment',
    url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Minimalist Waterfront Studio',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Charming suburban Townhouse',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Cozy Mid-Century Home',
    url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Industrial Loft Space',
    url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=200&q=80'
  }
];

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    title: 'Serene Crest Villa',
    price: 5800000,
    description: 'A masterpiece of contemporary architecture, Serene Crest Villa offers breathtaking panoramic valley views, seamless indoor-outdoor living, and bespoke custom finishes throughout. Featuring an infinity edge pool, state-of-the-art chef’s kitchen, and a private wellness wing.',
    type: 'sale',
    propertyType: 'Villa',
    location: 'Damansara Heights, Kuala Lumpur',
    address: 'Jalan Dungun, Damansara Heights, 50490 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur, Malaysia',
    bedrooms: 5,
    bathrooms: 6,
    area: 5800,
    imageUrl: PRESET_IMAGES[0].url,
    additionalImages: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80'
    ],
    agentName: 'Daniel Wan',
    agentPhone: '01119602980',
    agentEmail: 'wandaniel554@gmail.com',
    agentPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80',
    status: 'available',
    amenities: ['Infinity Pool', 'Home Cinema', 'Wine Cellar', 'Smart Home System', 'Chef\'s Kitchen', 'Garage (3 Cars)'],
    featured: true,
    createdAt: new Date('2026-06-15').toISOString()
  },
  {
    id: 'prop-2',
    title: 'Vanguard Heights Penthouse',
    price: 15000,
    description: 'Suspended above the city skyline, this ultra-luxurious penthouse apartment defines high-end metropolitan living. Double-height floor-to-ceiling windows flood the living spaces with natural light, offering unobstructed 360-degree metropolitan views.',
    type: 'rent',
    propertyType: 'Apartment',
    location: 'KLCC, Kuala Lumpur',
    address: 'Persiaran KLCC, Kuala Lumpur City Centre, 50088 Kuala Lumpur, Malaysia',
    bedrooms: 3,
    bathrooms: 3.5,
    area: 3200,
    imageUrl: PRESET_IMAGES[2].url,
    additionalImages: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    agentName: 'Daniel Wan',
    agentPhone: '01119602980',
    agentEmail: 'wandaniel554@gmail.com',
    agentPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80',
    status: 'available',
    amenities: ['24/7 Concierge', 'Private Terrace', 'Rooftop Access', 'Fitness Studio', 'Floor-to-Ceiling Windows'],
    featured: true,
    createdAt: new Date('2026-07-01').toISOString()
  },
  {
    id: 'prop-3',
    title: 'The Midwood Estate',
    price: 3900000,
    description: 'Nestled within a pristine suburban community, The Midwood Estate is a meticulously crafted family home combining timeless traditional design with high-end modern amenities. Beautiful manicured gardens wrap around the sprawling private estate.',
    type: 'sale',
    propertyType: 'House',
    location: 'Mont Kiara, Kuala Lumpur',
    address: 'Jalan Kiara, Mont Kiara, 50480 Kuala Lumpur, Malaysia',
    bedrooms: 4,
    bathrooms: 4,
    area: 4200,
    imageUrl: PRESET_IMAGES[1].url,
    additionalImages: [
      'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80'
    ],
    agentName: 'Daniel Wan',
    agentPhone: '01119602980',
    agentEmail: 'wandaniel554@gmail.com',
    agentPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80',
    status: 'available',
    amenities: ['Landscaped Gardens', 'Fireplace', 'Heated Floors', 'Sunroom', 'Outdoor Kitchen', 'Guest Suite'],
    featured: false,
    createdAt: new Date('2026-07-10').toISOString()
  },
  {
    id: 'prop-4',
    title: 'Azure Waters Waterfront',
    price: 8500000,
    description: 'Wake up to the gentle sound of ocean waves at this spectacular seaside modern sanctuary. Boasting private beach access, a sprawling ocean-facing patio, and glass sliding panels that dissolve the boundary between indoors and the marine landscape.',
    type: 'sale',
    propertyType: 'Condo',
    location: 'Batu Ferringhi, Penang',
    address: 'Jalan Batu Ferringhi, 11100 Batu Ferringhi, Pulau Pinang, Malaysia',
    bedrooms: 4,
    bathrooms: 4.5,
    area: 4500,
    imageUrl: PRESET_IMAGES[4].url,
    additionalImages: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    agentName: 'Daniel Wan',
    agentPhone: '01119602980',
    agentEmail: 'wandaniel554@gmail.com',
    agentPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80',
    status: 'available',
    amenities: ['Private Beach Access', 'Oceanfront Deck', 'Hot Tub', 'Solar Power', 'EV Charger', 'Floor-to-Ceiling Glass'],
    featured: true,
    createdAt: new Date('2026-07-12').toISOString()
  },
  {
    id: 'prop-5',
    title: 'Charming Oakwood Townhouse',
    price: 5500,
    description: 'Perfectly located near parks, dining, and transit, this newly updated townhouse blends historic brick exterior charm with high-spec contemporary internal upgrades. Ideal for professional couples seeking comfort and easy commute.',
    type: 'rent',
    propertyType: 'Townhouse',
    location: 'Bangsar, Kuala Lumpur',
    address: 'Jalan Telawi, Bangsar, 59100 Kuala Lumpur, Malaysia',
    bedrooms: 2,
    bathrooms: 2.5,
    area: 1850,
    imageUrl: PRESET_IMAGES[5].url,
    additionalImages: [],
    agentName: 'Daniel Wan',
    agentPhone: '01119602980',
    agentEmail: 'wandaniel554@gmail.com',
    agentPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80',
    status: 'available',
    amenities: ['Exposed Brick', 'Private Rooftop Deck', 'Hardwood Floors', 'Walk-in Closets', 'Smart Thermostat'],
    featured: false,
    createdAt: new Date('2026-07-05').toISOString()
  },
  {
    id: 'prop-6',
    title: 'Metro High-Rise Residence',
    price: 3200,
    description: 'Sophisticated modern 1-bedroom apartment in a premium downtown high-rise building. Exceptional building infrastructure including complete health spa amenities, secure underground parking, and dynamic city light vistas.',
    type: 'rent',
    propertyType: 'Apartment',
    location: 'Tanjung Tokong, Penang',
    address: 'Jalan Tanjung Tokong, 10470 Tanjung Tokong, Pulau Pinang, Malaysia',
    bedrooms: 1,
    bathrooms: 1,
    area: 950,
    imageUrl: PRESET_IMAGES[3].url,
    additionalImages: [],
    agentName: 'Daniel Wan',
    agentPhone: '01119602980',
    agentEmail: 'wandaniel554@gmail.com',
    agentPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80',
    status: 'pending',
    amenities: ['Gym & Spa Access', 'Underground Parking', 'Storage Unit', 'Concierge Desk', 'Stainless Steel Appliances'],
    featured: false,
    createdAt: new Date('2026-07-14').toISOString()
  }
];
