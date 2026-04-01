import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Map as MapIcon, Grid } from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard.js';
import { api } from '../services/api.js';
import { Property } from '../types.js';

export const Listings = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9; // adjust as needed

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await api.get('/properties');
        setProperties(data || []);
      } catch (err) {
        console.error('Failed to fetch properties:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter((p) => {
    const matchesType = filter === 'All' || p.type === filter;
    const matchesSearch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.zip?.includes(searchQuery);

    return matchesType && matchesSearch;
  });

  // Simple client-side pagination
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProperties = filteredProperties.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-brand-cream">
      {/* Hero Header */}
      <section className="bg-brand-navy text-white py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold">
              Browse Listings
            </h1>
            <p className="text-gray-300 text-lg md:text-xl">
              Discover your perfect property in Pennsboro and surrounding areas.
            </p>
          </div>

          <div className="flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-brand-gold text-brand-navy font-bold shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Grid className="w-5 h-5" /> Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              aria-label="Map view"
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                viewMode === 'map'
                  ? 'bg-brand-gold text-brand-navy font-bold shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <MapIcon className="w-5 h-5" /> Map
            </button>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="sticky top-[72px] z-40 bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm py-4 md:py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-5 lg:gap-8">
          <div className="relative w-full lg:w-80 xl:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by address, city, or ZIP..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // reset pagination on search
              }}
              className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 outline-none transition-all text-gray-800 placeholder-gray-500"
            />
          </div>

          <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start">
            {['All', 'Residential', 'Commercial', 'Land'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFilter(type);
                  setCurrentPage(1);
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  filter === type
                    ? 'bg-brand-navy text-white shadow-md'
                    : 'bg-white text-brand-navy border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            className="flex items-center gap-2 text-brand-navy font-semibold hover:text-brand-gold transition-colors whitespace-nowrap text-sm md:text-base"
            aria-label="More filters (coming soon)"
          >
            <Filter className="w-5 h-5" /> More Filters
          </button>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl h-[480px] animate-pulse shadow-sm border border-gray-100"
                />
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <>
              {paginatedProperties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {paginatedProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center">
                  <p className="text-xl text-gray-500 font-medium">
                    No properties found matching your criteria.
                  </p>
                  <p className="mt-3 text-gray-400">
                    Try adjusting your search or filters.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-3">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-brand-navy disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-navy hover:text-white transition-colors"
                    aria-label="Previous page"
                  >
                    ←
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-brand-navy text-white shadow-md'
                          : 'border border-gray-200 text-brand-navy hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-brand-navy disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-navy hover:text-white transition-colors"
                    aria-label="Next page"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-3xl shadow-2xl h-[70vh] min-h-[500px] flex items-center justify-center border border-gray-100">
              <div className="text-center space-y-6 px-6">
                <MapIcon className="w-20 h-20 text-brand-gold mx-auto opacity-30" />
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-brand-navy">
                  Interactive Map View
                </h3>
                <p className="text-gray-600 max-w-lg mx-auto">
                  In the live version, this section would display an interactive map (Google Maps or Mapbox) with property markers, clustering, and filters synced to the sidebar.
                </p>
                <p className="text-sm text-gray-500 italic">
                  Coming soon – currently in development.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
