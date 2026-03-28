import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Image as ImageIcon, FileText, Link as LinkIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../../services/api.js';

export const BlogForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<any>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    imageUrl: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchPost = async () => {
        try {
          const data = await api.get(`/posts/${id}`); // Note: Backend needs to support GET by ID or I use slug
          // Actually, I'll update server.ts to support GET /api/posts/id/:id
          const allPosts = await api.get('/posts');
          const post = allPosts.find((p: any) => p.id.toString() === id);
          if (post) setFormData(post);
        } catch (err) {
          console.error('Failed to fetch post', err);
          navigate('/admin/blog');
        }
      };
      fetchPost();
    }
  }, [id, isEdit, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => {
      const newData = { ...prev, [name]: value };
      // Auto-generate slug from title if not editing
      if (name === 'title' && !isEdit) {
        newData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return newData;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { url } = await api.upload(file);
      setFormData((prev: any) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEdit) {
        await api.put(`/posts/${id}`, formData);
      } else {
        await api.post('/posts', formData);
      }
      navigate('/admin/blog');
    } catch (err) {
      alert('Failed to save post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link to="/admin/blog" className="flex items-center gap-2 text-brand-navy font-bold hover:text-brand-gold transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Blog
        </Link>
        <h1 className="text-3xl font-serif font-bold text-brand-navy">
          {isEdit ? 'Edit Blog Post' : 'Create New Post'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        {/* Content Section */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-navy ml-1">Post Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Best Areas to Buy Property in Pennsboro"
              className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-navy ml-1">URL Slug</label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                name="slug"
                required
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-navy ml-1">Excerpt (Short Summary)</label>
            <textarea
              name="excerpt"
              required
              rows={3}
              value={formData.excerpt}
              onChange={handleInputChange}
              placeholder="A brief summary for the blog list page..."
              className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all resize-none"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-navy ml-1">Full Content (HTML Supported)</label>
            <textarea
              name="content"
              required
              rows={12}
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Write your post content here..."
              className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all font-mono text-sm"
            ></textarea>
            <p className="text-xs text-gray-400 italic">Tip: You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt; for formatting.</p>
          </div>
        </div>

        {/* Media Section */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-xl font-serif font-bold text-brand-navy border-b border-gray-50 pb-4">Featured Image</h3>
          <div className="flex flex-col gap-6">
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="post-image-upload"
              />
              <label
                htmlFor="post-image-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-brand-cream hover:border-brand-gold transition-all group overflow-hidden relative"
              >
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Featured" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <ImageIcon className="w-10 h-10 mb-2 group-hover:text-brand-gold" />
                    <span className="text-sm font-medium">Click to upload featured image</span>
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
                {isEdit ? 'Update Post' : 'Publish Post'}
              </>
            )}
          </button>
          <Link
            to="/admin/blog"
            className="px-8 py-4 rounded-full border-2 border-gray-200 text-gray-400 font-bold hover:bg-gray-50 transition-all"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};
