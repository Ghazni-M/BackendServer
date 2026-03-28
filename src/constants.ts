import { Property, Testimonial, Service } from './types.js';

export const PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Historic Pennsboro Charm',
    price: 245000,
    beds: 3,
    baths: 2,
    sqft: 1850,
    address: '123 Main St',
    city: 'Pennsboro',
    state: 'WV',
    zip: '26415',
    type: 'Residential',
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Beautifully restored Victorian home in the heart of Pennsboro. Features original hardwood floors and modern updates.',
    features: ['Hardwood Floors', 'Victorian Architecture', 'Modern Kitchen', 'Historic District']
  },
  {
    id: '2',
    title: 'Scenic Mountain Retreat',
    price: 389000,
    beds: 4,
    baths: 3,
    sqft: 2400,
    address: '456 Ridge View Dr',
    city: 'Pennsboro',
    state: 'WV',
    zip: '26415',
    type: 'Residential',
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Breathtaking views of the West Virginia hills. This custom-built home offers privacy and luxury.',
    features: ['Mountain Views', 'Privacy', 'Custom Build', 'Large Deck']
  },
  {
    id: '3',
    title: 'Modern Family Estate',
    price: 315000,
    beds: 3,
    baths: 2.5,
    sqft: 2100,
    address: '789 Valley Rd',
    city: 'Pennsboro',
    state: 'WV',
    zip: '26415',
    type: 'Residential',
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Spacious open-concept living with a large backyard perfect for families.',
    features: ['Open Concept', 'Large Backyard', 'Family Friendly', 'Attached Garage']
  },
  {
    id: '4',
    title: 'Downtown Commercial Space',
    price: 175000,
    beds: 0,
    baths: 1,
    sqft: 1200,
    address: '101 Broadway',
    city: 'Pennsboro',
    state: 'WV',
    zip: '26415',
    type: 'Commercial',
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Prime location for your business in the growing downtown area.',
    features: ['Downtown Location', 'High Visibility', 'Flexible Space', 'Commercial Zoning']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah & Michael Thompson',
    role: 'Home Buyers',
    content: 'We were so lucky to find our dream home but felt even luckier to have someone on our side like Janet. She made the entire process seamless.',
    rating: 5
  },
  {
    id: '2',
    name: 'Robert Wilson',
    role: 'Home Seller',
    content: 'Janet went above and beyond both times for us. She handled everything with such professionalism and care. She became a friend.',
    rating: 5
  },
  {
    id: '3',
    name: 'Emily Davis',
    role: 'First-time Buyer',
    content: '3 months and sold! Helped me with options and tons of contacts to speed the process along. Highly recommend Ritchie Realty!',
    rating: 5
  }
];

export const SERVICES: Service[] = [
  {
    id: 'buying',
    title: 'Home Buying Assistance',
    description: 'Expert guidance to help you find and secure your perfect home in West Virginia.',
    icon: 'Home'
  },
  {
    id: 'selling',
    title: 'Home Selling & Marketing',
    description: 'Strategic marketing and professional representation to sell your property at the best price.',
    icon: 'Tag'
  },
  {
    id: 'valuation',
    title: 'Property Valuation',
    description: 'Accurate market analysis to determine the true value of your real estate assets.',
    icon: 'BarChart3'
  },
  {
    id: 'relocation',
    title: 'Relocation Support',
    description: 'Comprehensive assistance for individuals and families moving to or from the area.',
    icon: 'MapPin'
  },
  {
    id: 'negotiation',
    title: 'Contract Negotiation',
    description: 'Skilled negotiation to ensure your interests are protected in every transaction.',
    icon: 'FileText'
  },
  {
    id: 'consultation',
    title: 'Personalized Consultations',
    description: 'One-on-one advice tailored to your unique real estate goals and needs.',
    icon: 'Phone'
  }
];
