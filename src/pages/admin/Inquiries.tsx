import React, { useEffect, useState } from 'react';
import { Mail, Phone, Calendar, Trash2, CheckCircle, Clock, X, Reply, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../services/api.js';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const Inquiries = () => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInquiries = async () => {
    try {
      const data = await api.get('/inquiries');
      setInquiries(data);
    } catch (err) {
      console.error('Failed to fetch inquiries', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.put(`/inquiries/${id}`, { status });
      fetchInquiries();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/inquiries/${deleteId}`);
      setDeleteId(null);
      fetchInquiries();
    } catch (err) {
      alert('Failed to delete inquiry');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReply = (email: string, name: string, subject?: string) => {
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject || 'Inquiry Response - Ritchie Realty')}&body=${encodeURIComponent(`Hello ${name},\n\n`)}`;
    window.open(mailto, '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Inquirer</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Property</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Message</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
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
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic">No inquiries received yet.</td>
                </tr>
              ) : (
                inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <p className="font-bold text-brand-navy">{inquiry.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail className="w-3 h-3" /> {inquiry.email}
                        </div>
                        {inquiry.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Phone className="w-3 h-3" /> {inquiry.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {inquiry.property_title ? (
                        <p className="text-sm font-medium text-brand-navy">{inquiry.property_title}</p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">General Inquiry</p>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                        <Clock className="w-3 h-3" /> {new Date(inquiry.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td 
                      className="px-8 py-5 cursor-pointer group"
                      onClick={() => setSelectedInquiry(inquiry)}
                    >
                      <p className="text-sm text-gray-600 line-clamp-2 max-w-xs group-hover:text-brand-navy transition-colors">{inquiry.message}</p>
                      <span className="text-[10px] text-brand-gold font-bold opacity-0 group-hover:opacity-100 transition-opacity">Click to view full message</span>
                    </td>
                    <td className="px-8 py-5">
                      <select
                        value={inquiry.status}
                        onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                        className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border-none focus:ring-0 cursor-pointer ${
                          inquiry.status === 'New' ? 'bg-blue-50 text-blue-600' :
                          inquiry.status === 'Contacted' ? 'bg-orange-50 text-orange-600' :
                          'bg-green-50 text-green-600'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleReply(inquiry.email, inquiry.name, inquiry.property_title ? `Regarding: ${inquiry.property_title}` : undefined)}
                          className="p-2 text-gray-400 hover:text-brand-gold transition-colors"
                          title="Reply via Email"
                        >
                          <Reply className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(inquiry.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete Inquiry"
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
                <div className="h-6 bg-gray-100 rounded w-1/2"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-20 bg-gray-100 rounded-xl"></div>
              </div>
            ))
          ) : inquiries.length === 0 ? (
            <div className="p-12 text-center text-gray-400 italic">No inquiries received yet.</div>
          ) : (
            inquiries.map((inquiry) => (
              <div key={inquiry.id} className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-bold text-brand-navy">{inquiry.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {new Date(inquiry.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                  <select
                    value={inquiry.status}
                    onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                    className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border-none focus:ring-0 cursor-pointer ${
                      inquiry.status === 'New' ? 'bg-blue-50 text-blue-600' :
                      inquiry.status === 'Contacted' ? 'bg-orange-50 text-orange-600' :
                      'bg-green-50 text-green-600'
                    }`}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Property</p>
                  <p className="text-sm font-medium text-brand-navy">{inquiry.property_title || 'General Inquiry'}</p>
                </div>

                <div 
                  className="space-y-2 cursor-pointer"
                  onClick={() => setSelectedInquiry(inquiry)}
                >
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Message</p>
                  <p className="text-sm text-gray-600 line-clamp-3 italic">"{inquiry.message}"</p>
                  <p className="text-[10px] text-brand-gold font-bold">Tap to read more</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleReply(inquiry.email, inquiry.name, inquiry.property_title ? `Regarding: ${inquiry.property_title}` : undefined)}
                    className="flex-grow flex items-center justify-center gap-2 bg-brand-cream text-brand-navy py-3 rounded-xl font-bold text-sm"
                  >
                    <Reply className="w-4 h-4" /> Reply
                  </button>
                  <button
                    onClick={() => setDeleteId(inquiry.id)}
                    className="p-3 text-red-500 bg-red-50 rounded-xl"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      <AnimatePresence>
        {selectedInquiry && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInquiry(null)}
              className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-brand-cream/30">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-brand-navy">Inquiry Details</h3>
                  <p className="text-sm text-gray-500">Received on {new Date(selectedInquiry.created_at).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => setSelectedInquiry(null)}
                  className="p-2 rounded-full hover:bg-white transition-colors text-gray-400 hover:text-brand-navy"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-brand-navy">
                        <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center">
                          <Mail className="w-5 h-5 text-brand-gold" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email Address</p>
                          <p className="font-bold">{selectedInquiry.email}</p>
                        </div>
                      </div>
                      {selectedInquiry.phone && (
                        <div className="flex items-center gap-3 text-brand-navy">
                          <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center">
                            <Phone className="w-5 h-5 text-brand-gold" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Phone Number</p>
                            <p className="font-bold">{selectedInquiry.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Property Interest</h4>
                    <div className="p-4 rounded-2xl bg-brand-cream/50 border border-brand-cream">
                      {selectedInquiry.property_title ? (
                        <div className="space-y-1">
                          <p className="font-bold text-brand-navy">{selectedInquiry.property_title}</p>
                          <p className="text-xs text-gray-500">Property ID: #{selectedInquiry.property_id}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">General Inquiry (No specific property)</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Message</h4>
                  <div className="p-6 rounded-3xl bg-gray-50 text-gray-700 leading-relaxed whitespace-pre-wrap italic border border-gray-100">
                    "{selectedInquiry.message}"
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex gap-4">
                <button 
                  onClick={() => handleReply(selectedInquiry.email, selectedInquiry.name, selectedInquiry.property_title ? `Regarding: ${selectedInquiry.property_title}` : undefined)}
                  className="flex-grow btn-primary py-4 flex items-center justify-center gap-2"
                >
                  <Reply className="w-5 h-5" /> Reply to {selectedInquiry.name.split(' ')[0]}
                </button>
                <button 
                  onClick={() => setSelectedInquiry(null)}
                  className="px-8 py-4 rounded-full border-2 border-gray-200 text-gray-400 font-bold hover:bg-white transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Inquiry?"
        message="Are you sure you want to remove this inquiry? This action cannot be undone and the contact information will be lost."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Inquiry'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isDanger
      />
    </div>
  );
};
