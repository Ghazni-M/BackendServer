import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Square, MapPin, Box } from 'lucide-react';
import { Property } from '../types.js';
import { motion } from 'motion/react';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      layoutId={`card-${property.id}`}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="relative h-64 overflow-hidden">
        <motion.img
          layoutId={`img-${property.id}`}
          src={property.imageUrl}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 bg-brand-navy text-white px-3 py-1 rounded-full text-xs font-medium">
          {property.type}
        </div>
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
          property.status === 'Sold' ? 'bg-red-500 text-white' : 
          property.status === 'Pending' ? 'bg-brand-gold text-brand-navy' : 
          'bg-green-500 text-white'
        }`}>
          {property.status}
        </div>
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-brand-navy font-bold shadow-lg">
          ${property.price.toLocaleString()}
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-serif text-xl font-bold text-brand-navy mb-2">{property.title}</h3>
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4" />
          <span>{property.address}, {property.city}, {property.state}</span>
        </div>
        <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
          {property.type !== 'Land' && property.type !== 'Commercial' && property.beds > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <Bed className="w-4 h-4 text-brand-gold" />
              <span className="text-sm">{property.beds} Beds</span>
            </div>
          )}
          {property.type !== 'Land' && property.baths > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <Bath className="w-4 h-4 text-brand-gold" />
              <span className="text-sm">{property.baths} Baths</span>
            </div>
          )}
          {property.type !== 'Land' && property.sqft > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <Square className="w-4 h-4 text-brand-gold" />
              <span className="text-sm">{property.sqft} sqft</span>
            </div>
          )}
          {property.type === 'Land' && property.acreage && property.acreage > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-brand-gold" />
              <span className="text-sm">{property.acreage} Acres</span>
            </div>
          )}
          {property.type === 'Commercial' && property.zoning && (
            <div className="flex items-center gap-2 text-gray-600">
              <Box className="w-4 h-4 text-brand-gold" />
              <span className="text-sm">{property.zoning}</span>
            </div>
          )}
        </div>
        <Link 
          to={`/property/${property.id}`}
          className="w-full mt-6 btn-secondary py-2 text-sm flex items-center justify-center"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};
