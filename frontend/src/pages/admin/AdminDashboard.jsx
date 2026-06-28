import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Eye, Clock, CheckCircle } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, icon, color, bg, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-5 md:p-6 rounded-2xl flex items-center justify-between"
  >
    <div>
      <p className="text-white/50 text-sm font-medium">{label}</p>
      <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{value}</p>
    </div>
    <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color}`}>
      {icon}
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [statsRes, activityRes] = await Promise.all([
          axios.get('/api/analytics/dashboard', config),
          axios.get('/api/activity', config)
        ]);

        setStats(statsRes.data);
        setActivity(activityRes.data);
      } catch (error) {
        console.error('Failed to load dashboard', error);
      }
    };
    fetchDashboard();
  }, []);

  const statCards = [
    { label: 'Total People', value: stats?.totalPeople ?? '—', icon: <Users size={22} />, color: 'text-blue-400', bg: 'bg-blue-400/10', delay: 0 },
    { label: 'Total Views', value: stats?.totalViews ?? '—', icon: <Eye size={22} />, color: 'text-purple-400', bg: 'bg-purple-400/10', delay: 0.1 },
    { label: 'Avg Reading Time', value: stats?.averageReadingTime ? `${stats.averageReadingTime}s` : '—', icon: <Clock size={22} />, color: 'text-orange-400', bg: 'bg-orange-400/10', delay: 0.2 },
    { label: 'Completion Rate', value: stats?.completionRate ? `${stats.completionRate}%` : '—', icon: <CheckCircle size={22} />, color: 'text-emerald-400', bg: 'bg-emerald-400/10', delay: 0.3 },
  ];

  // Demo chart data
  const chartData = [
    { name: 'Mon', views: 12 },
    { name: 'Tue', views: 19 },
    { name: 'Wed', views: 15 },
    { name: 'Thu', views: 25 },
    { name: 'Fri', views: 22 },
    { name: 'Sat', views: 30 },
    { name: 'Sun', views: 28 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-white/50 mt-1 text-sm md:text-base">Overview of your personalized messages.</p>
        </div>

        {/* Stat Cards — 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {statCards.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 glass-card rounded-2xl p-5 md:p-6"
          >
            <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-6">Views this week (Demo)</h3>
            <div className="h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis stroke="#ffffff50" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="views" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-2xl p-5 md:p-6"
          >
            <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-6">Recent Activity</h3>
            <div className="space-y-4 overflow-y-auto max-h-64 md:max-h-72 pr-1">
              {activity.map((act) => (
                <div key={act._id} className="flex gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-purple-500 shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                  <div>
                    <p className="text-white/90 text-sm leading-snug">{act.message}</p>
                    <p className="text-white/40 text-xs mt-1">
                      {new Date(act.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {activity.length === 0 && (
                <p className="text-white/40 text-sm">No activity yet.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
