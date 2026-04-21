import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Users, UserCheck, UserX, MessageCircle, Mail, Shield, Calendar } from 'lucide-react';
import { NimartSpinner } from '../../components/common/NimartSpinner';

interface Stats {
  totalUsers: number;
  totalProviders: number;
  totalCustomers: number;
  bannedUsers: number;
  openChats: number;
  totalBookings: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProviders: 0,
    totalCustomers: 0,
    bannedUsers: 0,
    openChats: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const [
      profilesRes,
      providersRes,
      bannedRes,
      chatsRes,
      bookingsRes
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('providers').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_banned', true),
      supabase.from('support_chats').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('bookings').select('id', { count: 'exact', head: true })
    ]);

    setStats({
      totalUsers: profilesRes.count || 0,
      totalProviders: providersRes.count || 0,
      totalCustomers: (profilesRes.count || 0) - (providersRes.count || 0),
      bannedUsers: bannedRes.count || 0,
      openChats: chatsRes.count || 0,
      totalBookings: bookingsRes.count || 0,
    });
    setLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <NimartSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <Users className="h-8 w-8 text-primary-600 mb-2" />
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <UserCheck className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-2xl font-bold">{stats.totalProviders}</p>
              <p className="text-sm text-gray-500">Providers</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <p className="text-2xl font-bold">{stats.totalCustomers}</p>
              <p className="text-sm text-gray-500">Customers</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <UserX className="h-8 w-8 text-red-600 mb-2" />
              <p className="text-2xl font-bold">{stats.bannedUsers}</p>
              <p className="text-sm text-gray-500">Banned</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <MessageCircle className="h-8 w-8 text-yellow-600 mb-2" />
              <p className="text-2xl font-bold">{stats.openChats}</p>
              <p className="text-sm text-gray-500">Open Chats</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <Calendar className="h-8 w-8 text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{stats.totalBookings}</p>
              <p className="text-sm text-gray-500">Bookings</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link to="/admin/users" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition">
              <Users className="h-8 w-8 text-primary-600 mb-4" />
              <h3 className="font-semibold text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-500">View, ban, or delete users</p>
            </Link>
            <Link to="/admin/chats" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition">
              <MessageCircle className="h-8 w-8 text-primary-600 mb-4" />
              <h3 className="font-semibold text-gray-900">Support Chats</h3>
              <p className="text-sm text-gray-500">Respond to user inquiries</p>
            </Link>
            <Link to="/admin/email" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition">
              <Mail className="h-8 w-8 text-primary-600 mb-4" />
              <h3 className="font-semibold text-gray-900">Bulk Email</h3>
              <p className="text-sm text-gray-500">Send emails to all users</p>
            </Link>
            <Link to="/admin/settings" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition">
              <Shield className="h-8 w-8 text-primary-600 mb-4" />
              <h3 className="font-semibold text-gray-900">Settings</h3>
              <p className="text-sm text-gray-500">Platform configuration</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}