import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, MessageSquare, TrendingUp, CheckCircle, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../../services/api.js';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return <div className="animate-pulse space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-3xl"></div>)}
    </div>
    <div className="h-96 bg-gray-200 rounded-3xl"></div>
  </div>;

  const statCards = [
    { name: 'Total Listings', value: stats.totalListings, icon: Home, color: 'bg-blue-50 text-blue-600' },
    { name: 'Active Listings', value: stats.activeListings, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { name: 'Sold Listings', value: stats.soldListings, icon: CheckCircle, color: 'bg-purple-50 text-purple-600' },
    { name: 'Total Inquiries', value: stats.totalInquiries, icon: MessageSquare, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-2xl`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Overview</span>
              </div>
              <h3 className="text-3xl font-bold text-brand-navy mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-serif font-bold text-brand-navy">Recent Activity</h3>
            <button 
              onClick={() => navigate('/admin/inquiries')}
              className="text-sm font-bold text-brand-gold hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-6">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="bg-brand-gold/10 p-2 rounded-full">
                    <MessageSquare className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="text-brand-navy font-medium">
                      New inquiry from <span className="font-bold">{activity.name}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {activity.message}
                    </p>
                    <p className="text-xs text-brand-gold font-medium mt-2">
                      {new Date(activity.created_at).toLocaleString('en-US', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-12 italic">No recent activity to display.</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-serif font-bold text-brand-navy">Featured Properties</h3>
            <span className="bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-xs font-bold">
              {stats.featuredProperties} Active
            </span>
          </div>
          <div className="space-y-6">
             <p className="text-gray-400 text-center py-12 italic">Manage your featured listings in the Properties section.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
