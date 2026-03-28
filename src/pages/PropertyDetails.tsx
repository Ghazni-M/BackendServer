import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bed, Bath, Square, MapPin, ArrowLeft, Phone, Mail, Calendar, Share2, Heart, Play, Box } from 'lucide-react';
import { Property } from '../types.js';
import { api } from '../services/api.js';
import { ContactForm } from '../components/ContactForm';

export const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await api.get(`/properties/${id}`);
        setProperty(data);
        setActiveImage(data.imageUrl);
      } catch (err) {
        console.error('Failed to fetch property', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (isLoading) {
    return (
      <div className="pt-40 pb-20 text-center animate-pulse">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          <div className="h-96 bg-gray-200 rounded-3xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 h-64 bg-gray-200 rounded-3xl"></div>
            <div className="lg:col-span-1 h-64 bg-gray-200 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="pt-40 pb-20 text-center">
        <h2 className="text-3xl font-serif font-bold text-brand-navy">Property Not Found</h2>
        <Link to="/listings" className="text-brand-gold hover:underline mt-4 inline-block">
          Back to Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-brand-cream">
      {/* Breadcrumbs & Actions */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap justify-between items-center gap-4">
        <Link to="/listings" className="flex items-center gap-2 text-brand-navy font-bold hover:text-brand-gold transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Listings
        </Link>
        <div className="flex gap-4">
          <button className="p-3 rounded-full bg-white shadow-sm hover:shadow-md transition-all text-brand-navy hover:text-brand-gold">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-3 rounded-full bg-white shadow-sm hover:shadow-md transition-all text-brand-navy hover:text-brand-gold">
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Gallery Section */}
      <section className="px-4 md:px-6 pb-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          <div className="lg:col-span-8">
            <motion.div 
              layoutId={`img-${property.id}`}
              className="aspect-[16/10] rounded-2xl md:rounded-3xl overflow-hidden shadow-xl bg-gray-200"
            >
              <img
                src={activeImage}
                alt={property.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
          <div className="lg:col-span-4 flex lg:grid lg:grid-cols-1 gap-3 md:gap-4 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {[property.imageUrl, ...property.images].filter((img, i, self) => self.indexOf(img) === i).map((img, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`flex-shrink-0 w-32 lg:w-full aspect-[16/10] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer border-2 md:border-4 transition-all ${activeImage === img ? 'border-brand-gold' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <img
                  src={img}
                  alt={`${property.title} view ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="section-padding pt-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-10">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <span className="bg-brand-navy text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  {property.type}
                </span>
                <span className={`${
                  property.status === 'Sold' ? 'bg-red-500 text-white' : 
                  property.status === 'Pending' ? 'bg-brand-gold text-brand-navy' : 
                  'bg-green-500 text-white'
                } px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest`}>
                  {property.status}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-navy">{property.title}</h1>
              <div className="flex items-center gap-2 text-gray-500 text-lg">
                <MapPin className="w-5 h-5 text-brand-gold" />
                <span>{property.address}, {property.city}, {property.state} {property.zip}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-gray-200">
              <div className="space-y-1">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Price</p>
                <p className="text-2xl font-bold text-brand-navy">${property.price.toLocaleString()}</p>
              </div>
              {property.type !== 'Land' && property.type !== 'Commercial' && property.beds > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Bedrooms</p>
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-brand-gold" />
                    <p className="text-xl font-bold text-brand-navy">{property.beds}</p>
                  </div>
                </div>
              )}
              {property.type !== 'Land' && property.baths > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Bathrooms</p>
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-brand-gold" />
                    <p className="text-xl font-bold text-brand-navy">{property.baths}</p>
                  </div>
                </div>
              )}
              {property.type !== 'Land' && property.sqft > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Square Feet</p>
                  <div className="flex items-center gap-2">
                    <Square className="w-5 h-5 text-brand-gold" />
                    <p className="text-xl font-bold text-brand-navy">{property.sqft.toLocaleString()}</p>
                  </div>
                </div>
              )}
              {property.type === 'Land' && property.acreage && property.acreage > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Acreage</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-gold" />
                    <p className="text-xl font-bold text-brand-navy">{property.acreage} Acres</p>
                  </div>
                </div>
              )}
              {property.type === 'Commercial' && property.zoning && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Zoning</p>
                  <div className="flex items-center gap-2">
                    <Box className="w-5 h-5 text-brand-gold" />
                    <p className="text-xl font-bold text-brand-navy">{property.zoning}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-serif font-bold text-brand-navy">Description</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Video & Virtual Tour */}
            {(property.videoUrl || property.virtualTourUrl) && (
              <div className="space-y-10 py-10 border-t border-gray-200">
                {property.videoUrl && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-navy p-2 rounded-lg">
                        <Play className="w-5 h-5 text-brand-gold fill-brand-gold" />
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-brand-navy">Video Tour</h3>
                    </div>
                    <div className="aspect-video rounded-3xl overflow-hidden shadow-xl bg-black">
                      <iframe
                        width="100%"
                        height="100%"
                        src={property.videoUrl.replace('watch?v=', 'embed/')}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}

                {property.virtualTourUrl && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-navy p-2 rounded-lg">
                        <Box className="w-5 h-5 text-brand-gold" />
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-brand-navy">360° Virtual Tour</h3>
                    </div>
                    <div className="aspect-video rounded-3xl overflow-hidden shadow-xl bg-gray-100 border border-gray-200">
                      <iframe
                        width="100%"
                        height="100%"
                        src={property.virtualTourUrl}
                        title="Virtual Tour"
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <p className="text-sm text-gray-500 italic text-center">
                      Click and drag to explore the property in 360 degrees.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-6">
              <h3 className="text-2xl font-serif font-bold text-brand-navy">Property Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.features && property.features.length > 0 ? (
                  property.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                      <span>{feature}</span>
                    </div>
                  ))
                ) : (
                  [
                    'Hardwood Flooring',
                    'Updated Kitchen',
                    'Central Heating & Cooling',
                    'Spacious Backyard',
                    'Attached Garage',
                    'Energy Efficient Windows',
                    'High Ceilings',
                    'Quiet Neighborhood'
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                      <span>{feature}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar / Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-50 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-brand-cream">
                    <img 
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200" 
                      alt="Janet" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl font-bold text-brand-navy">Janet</h4>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Principal Broker</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <a 
                    href="tel:+13046593067"
                    className="w-full btn-primary flex items-center justify-center gap-2 py-4"
                  >
                    <Phone className="w-5 h-5" /> Call Agent
                  </a>
                  <a 
                    href={`mailto:janetstanley@frontier.com?subject=Inquiry regarding ${property.title}&body=I am interested in ${property.title} located at ${property.address}. Please provide more information.`}
                    className="w-full btn-secondary flex items-center justify-center gap-2 py-4"
                  >
                    <Mail className="w-5 h-5" /> Email Agent
                  </a>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h5 className="font-serif font-bold text-brand-navy mb-4">Request Information</h5>
                  <ContactForm 
                    propertyId={Number(property.id)} 
                    defaultMessage={`I'm interested in viewing ${property.title} at ${property.address}.`} 
                  />
                </div>
              </div>

              <div className="bg-brand-navy text-white p-8 rounded-[2rem] shadow-xl space-y-4">
                <h4 className="font-serif text-xl font-bold">Mortgage Calculator</h4>
                <p className="text-sm text-gray-400">Estimated monthly payment:</p>
                <p className="text-3xl font-bold text-brand-gold">${Math.round(property.price / 180).toLocaleString()}/mo</p>
                <p className="text-[10px] text-gray-500 italic">*Based on 30-year fixed rate at 6.5% with 20% down payment.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
