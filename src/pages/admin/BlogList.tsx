import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, ExternalLink, Calendar, User } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../../services/api.js';
import { Post } from '../../types.js';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const BlogList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPosts = async () => {
    try {
      const data = await api.get('/posts');
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/posts/${deleteId}`);
      setDeleteId(null);
      fetchPosts();
    } catch (err) {
      alert('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-serif font-bold text-brand-navy">Blog Posts</h1>
        <Link to="/admin/blog/new" className="btn-primary flex items-center gap-2 w-fit">
          <Plus className="w-5 h-5" /> New Post
        </Link>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="pb-4 font-serif font-bold text-brand-navy px-4">Post</th>
                <th className="pb-4 font-serif font-bold text-brand-navy px-4">Author</th>
                <th className="pb-4 font-serif font-bold text-brand-navy px-4">Date</th>
                <th className="pb-4 font-serif font-bold text-brand-navy px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td colSpan={4} className="py-8 bg-gray-50 rounded-xl mb-2"></td>
                  </tr>
                ))
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400 font-medium">
                    No posts found.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <motion.tr 
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group hover:bg-brand-cream transition-colors border-b border-gray-50 last:border-none"
                  >
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <img 
                            src={post.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=200'} 
                            alt={post.title} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-brand-navy truncate max-w-[300px]">{post.title}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[300px]">/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4 text-brand-gold" />
                        {post.author_email?.split('@')[0]}
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-brand-gold" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-6 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/blog/${post.slug}`} 
                          target="_blank"
                          className="p-2 rounded-xl text-gray-400 hover:text-brand-navy hover:bg-white transition-all shadow-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link 
                          to={`/admin/blog/edit/${post.id}`}
                          className="p-2 rounded-xl text-brand-navy hover:text-brand-gold hover:bg-white transition-all shadow-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => setDeleteId(post.id)}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Blog Post?"
        message="Are you sure you want to remove this article? This action is permanent and will remove the post from the public website."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Post'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isDanger
      />
    </div>
  );
};
