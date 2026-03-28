import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus, X, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../../services/api.js';

export const PropertyForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<any>({
    title: '',
    price: '',
    address: '',
    city: 'Pennsboro',
    state: 'WV',
    zip: '26415',
    beds: '',
    baths: '',
    sqft: '',
    type: 'Residential',
    status: 'Available',
    featured: false,
    imageUrl: '',
    images: [],
    videoUrl: '',
    virtualTourUrl: '',
    description: '',
    features: [],
    acreage: '',
    zoning: '',
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchProperty = async () => {
        try {
          const data = await api.get(`/properties/${id}`);
          setFormData(data);
        } catch (err) {
          console.error('Failed to fetch property', err);
          navigate('/admin/properties');
        }
      };
      fetchProperty();
    }
  }, [id, isEdit, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev: any) => ({ ...prev, [name]: val }));
  };

  const handleAddImage = () => {
    if (!newImageUrl) return;
    setFormData((prev: any) => ({
      ...prev,
      images: [...prev.images, newImageUrl],
    }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (idx: number) => {
    setFormData((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== idx),
    }));
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    if (formData.features.includes(newFeature.trim())) {
      setNewFeature('');
      return;
    }
    setFormData((prev: any) => ({
      ...prev,
      features: [...prev.features, newFeature.trim()],
    }));
    setNewFeature('');
  };

  const handleRemoveFeature = (feature: string) => {
    setFormData((prev: any) => ({
      ...prev,
      features: prev.features.filter((f: string) => f !== feature),
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'gallery') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newImages = [...formData.images];
      for (let i = 0; i < files.length; i++) {
        const { url } = await api.upload(files[i]);
        if (type === 'main') {
          setFormData((prev: any) => ({ ...prev, imageUrl: url }));
          break;
        } else {
          newImages.push(url);
        }
      }
      if (type === 'gallery') {
        setFormData((prev: any) => ({ ...prev, images: newImages }));
      }
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Clean data for submission
    const submissionData = {
      ...formData,
      beds: formData.type === 'Land' || formData.type === 'Commercial' ? 0 : Number(formData.beds) || 0,
      baths: formData.type === 'Land' ? 0 : Number(formData.baths) || 0,
      sqft: formData.type === 'Land' ? 0 : Number(formData.sqft) || 0,
      acreage: Number(formData.acreage) || 0,
    };

    try {
      if (isEdit) {
        await api.put(`/properties/${id}`, submissionData);
      } else {
        await api.post('/properties', submissionData);
      }
      navigate('/admin/properties');
    } catch (err) {
      alert('Failed to save property');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link to="/admin/properties" className="flex items-center gap-2 text-brand-navy font-bold hover:text-brand-gold transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Properties
        </Link>
        <h1 className="text-3xl font-serif font-bold text-brand-navy">
          {isEdit ? 'Edit Property' : 'Add New Property'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        {/* Basic Info */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-xl font-serif font-bold text-brand-navy border-b border-gray-50 pb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-navy ml-1">Property Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Modern Family Estate"
                className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-navy ml-1">Price ($)</label>
              <input
                type="number"
                name="price"
                required
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g. 250000"
                className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-navy ml-1">Address</label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleInputChange}
              placeholder="e.g. 123 Main St"
              className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-navy ml-1">City</label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-navy ml-1">State</label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-navy ml-1">ZIP Code</label>
              <input
                type="text"
                name="zip"
                required
                value={formData.zip}
                onChange={handleInputChange}
                className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-xl font-serif font-bold text-brand-navy border-b border-gray-50 pb-4">Property Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {formData.type !== 'Land' && formData.type !== 'Commercial' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-navy ml-1">Bedrooms</label>
                <input
                  type="number"
                  name="beds"
                  required
                  value={formData.beds}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all"
                />
              </div>
            )}
            {formData.type !== 'Land' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-navy ml-1">Bathrooms</label>
                <input
                  type="number"
                  step="0.5"
                  name="baths"
                  required
                  value={formData.baths}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all"
                />
              </div>
            )}
            {formData.type !== 'Land' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-navy ml-1">Square Feet</label>
                <input
                  type="number"
                  name="sqft"
                  required
                  value={formData.sqft}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all"
                />
              </div>
            )}
            {formData.type === 'Land' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-navy ml-1">Acreage</label>
                <input
                  type="number"
                  step="0.01"
                  name="acreage"
                  required
                  value={formData.acreage}
                  onChange={handleInputChange}
                  placeholder="e.g. 5.25"
                  className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all"
                />
              </div>
            )}
            {formData.type === 'Commercial' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-navy ml-1">Zoning</label>
                <input
                  type="text"
                  name="zoning"
                  required
                  value={formData.zoning}
                  onChange={handleInputChange}
                  placeholder="e.g. C-1, Industrial..."
                  className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-navy ml-1">Property Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all appearance-none"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Land">Land</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-navy ml-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all appearance-none"
              >
                <option value="Available">Available</option>
                <option value="Sold">Sold</option>
                <option value="Under Contract">Under Contract</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-navy ml-1">Description</label>
            <textarea
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all resize-none"
            ></textarea>
          </div>
          <div className="flex items-center gap-3 ml-1">
            <input
              type="checkbox"
              name="featured"
              id="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="w-5 h-5 rounded border-gray-300 text-brand-navy focus:ring-brand-gold"
            />
            <label htmlFor="featured" className="text-sm font-semibold text-brand-navy">Feature this property on homepage</label>
          </div>

          {/* Property Features */}
          <div className="space-y-4 pt-6 border-t border-gray-50">
            <label className="text-sm font-semibold text-brand-navy ml-1">Property Features</label>
            <div className="flex gap-4">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                placeholder="e.g. Hardwood Floors, Central AC..."
                className="flex-grow px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="bg-brand-gold text-brand-navy p-4 rounded-2xl hover:bg-brand-gold/90 transition-all"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {formData.features.map((feature: string, idx: number) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-full text-sm font-medium group"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(feature)}
                    className="text-brand-gold hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {formData.features.length === 0 && (
                <p className="text-sm text-gray-400 italic ml-1">No features added yet. Add some to highlight property highlights.</p>
              )}
            </div>
          </div>
        </div>

        {/* Virtual Tour & Video */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-xl font-serif font-bold text-brand-navy border-b border-gray-50 pb-4">Virtual Tour & Video</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-navy ml-1">YouTube Video URL</label>
              <input
                type="text"
                name="videoUrl"
                value={formData.videoUrl || ''}
                onChange={handleInputChange}
                placeholder="e.g. https://www.youtube.com/watch?v=..."
                className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-navy ml-1">360° Virtual Tour URL</label>
              <input
                type="text"
                name="virtualTourUrl"
                value={formData.virtualTourUrl || ''}
                onChange={handleInputChange}
                placeholder="e.g. Matterport or other 360 link"
                className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-xl font-serif font-bold text-brand-navy border-b border-gray-50 pb-4">Media & Images</h3>
          
          <div className="space-y-4">
            <label className="text-sm font-semibold text-brand-navy ml-1">Main Property Image</label>
            <div className="flex flex-col gap-4">
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'main')}
                  className="hidden"
                  id="main-image-upload"
                />
                <label
                  htmlFor="main-image-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-brand-cream hover:border-brand-gold transition-all group overflow-hidden relative"
                >
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Main" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <ImageIcon className="w-10 h-10 mb-2 group-hover:text-brand-gold" />
                      <span className="text-sm font-medium">Click to upload main image</span>
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Or provide image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-50">
            <label className="text-sm font-semibold text-brand-navy ml-1">Gallery Images</label>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, 'gallery')}
                  className="hidden"
                  id="gallery-image-upload"
                />
                <label
                  htmlFor="gallery-image-upload"
                  className="flex-grow flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-brand-navy text-white font-bold cursor-pointer hover:bg-brand-navy/90 transition-all"
                >
                  <Plus className="w-5 h-5" /> Upload Gallery Images
                </label>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Or add image URL</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-grow px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="bg-brand-gold text-brand-navy p-4 rounded-2xl hover:bg-brand-gold/90 transition-all"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {formData.images.map((img: string, idx: number) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm">
                  <img src={img} alt="Gallery" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {formData.images.length === 0 && (
                <div className="col-span-full py-12 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-300">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <p className="text-sm font-medium">No gallery images added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-grow btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEdit ? 'Save Changes' : 'Publish Property'}
              </>
            )}
          </button>
          <Link
            to="/admin/properties"
            className="px-8 py-4 rounded-full border-2 border-gray-200 text-gray-400 font-bold hover:bg-gray-50 transition-all"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};
