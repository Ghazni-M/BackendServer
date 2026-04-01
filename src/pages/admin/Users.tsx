import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api.js';
import { ConfirmDialog } from '../../components/ConfirmDialog.js';

// Define user shape based on backend response
interface User {
  id: number;
  name: string;
  email: string;
  role: 'agent' | 'owner';
}

interface FormData {
  name: string;
  email: string;
  password: string;
  role: 'agent' | 'owner';
}

export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    role: 'agent',
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get('/users'); // correct: api prepends /api

      const userList = response?.users ?? [];

      if (!Array.isArray(userList)) {
        throw new Error('Expected users to be an array');
      }

      setUsers(userList);
    } catch (err: any) {
      let msg = 'Failed to load users';

      if (err?.response?.status === 401) {
        msg = 'Please log in as owner to view users';
      } else if (err?.response?.status === 403) {
        msg = 'You do not have permission to view this page';
      } else {
        msg = err.message || 'An unexpected error occurred';
      }

      setError(msg);
      console.error('Fetch users failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user?: User) => {
    setFormError(null);

    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'agent',
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'agent',
      });
    }

    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;

    setIsDeleting(true);
    try {
      await api.delete(`/users/${deleteId}`); // correct
      setDeleteId(null);
      await fetchUsers();
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(err.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Name and email are required');
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      setFormError('Password is required when creating a new user');
      return;
    }

    if (formData.password && formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: Partial<FormData> = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
      };

      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      let response;
      if (editingUser) {
        response = await api.put(`/users/${editingUser.id}`, payload);
      } else {
        response = await api.post('/users', payload);
      }

      if (!response?.success) {
        throw new Error(response?.error || 'Operation failed');
      }

      setIsModalOpen(false);
      await fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to save user';
      setFormError(msg);
      console.error('Save user error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-serif font-bold text-brand-navy">
          Authorized Personnel
        </h1>

        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2 w-fit"
          disabled={isSubmitting}
        >
          <Plus className="w-5 h-5" /> Add New User
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none transition-all"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="pb-4 font-serif font-bold text-brand-navy px-4">User</th>
                <th className="pb-4 font-serif font-bold text-brand-navy px-4">Role</th>
                <th className="pb-4 font-serif font-bold text-brand-navy px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                [1, 2, 3].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td colSpan={3} className="py-8 bg-gray-50 rounded-xl" />
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-gray-400 font-medium">
                    No authorized personnel found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group hover:bg-brand-cream transition-colors border-b border-gray-50 last:border-none"
                  >
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-brand-navy flex items-center justify-center text-brand-gold font-bold text-lg">
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-brand-navy">{user.name || 'Unnamed'}</p>
                          <p className="text-sm text-gray-400">{user.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-6 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                          user.role === 'owner'
                            ? 'bg-brand-gold text-brand-navy'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="py-6 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-2 rounded-xl text-brand-navy hover:text-brand-gold hover:bg-white transition-all shadow-sm"
                          disabled={isSubmitting || isDeleting}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteId(user.id)}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-all shadow-sm"
                          disabled={isSubmitting || isDeleting}
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

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold text-brand-navy">
                  {editingUser ? 'Edit User' : 'Add Authorized User'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-brand-navy"
                  disabled={isSubmitting}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {formError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {editingUser ? 'New Password (optional)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    placeholder={editingUser ? 'New Password (optional)' : 'Password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none"
                    required={!editingUser}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as 'agent' | 'owner' })
                    }
                    className="w-full px-6 py-4 rounded-2xl bg-brand-cream border-none focus:ring-2 focus:ring-brand-gold outline-none"
                    disabled={isSubmitting}
                  >
                    <option value="agent">Agent</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-4 flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting
                    ? 'Saving...'
                    : editingUser
                    ? 'Update User'
                    : 'Create User'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Revoke Access?"
        message="This user will be permanently removed."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isDanger
      />
    </div>
  );
};
