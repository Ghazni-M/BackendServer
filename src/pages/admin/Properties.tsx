import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, ExternalLink, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../../services/api.js';
import { ConfirmDialog } from '../../components/ConfirmDialog.js';

export const Properties = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProperties = async () => {
    try {
      const data = await api.get('/properties');
      setProperties(data);
    } catch (err) {
      console.error('Failed to fetch properties', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/properties/${deleteId}`);
      setDeleteId(null);
      fetchProperties();
    } catch (err) {
      alert('Failed to delete property');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3 rounded-2xl bg-white border border-gray-200 focus:ring-2 focus:ring-brand-gold outline-none transition-all"
          />
        </div>
        <Link to="/admin/properties/new" className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center">
          <Plus className="w-5 h-5" /> Add Property
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Property</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Price</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Featured</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-8"><div className="h-12 bg-gray-100 rounded-xl"></div></td>
                  </tr>
                ))
              ) : filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic">No properties found.</td>
                </tr>
              ) : (
                filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={property.imageUrl}
                          alt={property.title}
                          className="w-12 h-12 rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-brand-navy">{property.title}</p>
                          <p className="text-xs text-gray-500">{property.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-brand-navy">${property.price.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        property.status === 'Available' ? 'bg-green-50 text-green-600' :
                        property.status === 'Sold' ? 'bg-red-50 text-red-600' :
                        'bg-orange-50 text-orange-600'
                      }`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {property.featured ? (
                        <Star className="w-5 h-5 fill-brand-gold text-brand-gold" />
                      ) : (
                        <Star className="w-5 h-5 text-gray-200" />
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/property/${property.id}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-brand-navy transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/admin/properties/edit/${property.id}`}
                          className="p-2 text-gray-400 hover:text-brand-gold transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(property.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="p-6 animate-pulse space-y-4">
                <div className="h-24 bg-gray-100 rounded-2xl"></div>
                <div className="h-6 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))
          ) : filteredProperties.length === 0 ? (
            <div className="p-12 text-center text-gray-400 italic">No properties found.</div>
          ) : (
            filteredProperties.map((property) => (
              <div key={property.id} className="p-6 space-y-4">
                <div className="flex gap-4">
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="w-20 h-20 rounded-2xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-grow space-y-1">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-brand-navy leading-tight">{property.title}</p>
                      {property.featured && <Star className="w-4 h-4 fill-brand-gold text-brand-gold flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500">{property.address}</p>
                    <p className="font-bold text-brand-gold">${property.price.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    property.status === 'Available' ? 'bg-green-50 text-green-600' :
                    property.status === 'Sold' ? 'bg-red-50 text-red-600' :
                    'bg-orange-50 text-orange-600'
                  }`}>
                    {property.status}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      to={`/property/${property.id}`}
                      target="_blank"
                      className="p-2 text-gray-400 bg-gray-50 rounded-lg"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/admin/properties/edit/${property.id}`}
                      className="p-2 text-brand-navy bg-brand-cream rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteId(property.id)}
                      className="p-2 text-red-500 bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Property?"
        message="This action cannot be undone. All data associated with this property will be permanently removed from the system."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Property'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isDanger
      />
    </div>
  );
};
