import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Star, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { NimartSpinner } from '../../components/common/NimartSpinner';

interface Booking {
  id: string;
  booking_number: string;
  provider_id: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  location: string;
  special_instructions: string | null;
  status: string;
  created_at: string;
  provider?: {
    business_name: string | null;
    profile: {
      full_name: string | null;
    } | null;
  };
}

export default function CustomerBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (user) fetchBookings();
  }, [user, filterStatus]);

  async function fetchBookings() {
    setLoading(true);
    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', user!.id)
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data: bookingsData, error } = await query;
      if (error) throw error;
      if (!bookingsData || bookingsData.length === 0) {
        setBookings([]);
        setLoading(false);
        return;
      }

      // Get unique provider IDs
      const providerIds = [...new Set(bookingsData.map(b => b.provider_id))];

      // Fetch provider details (two separate queries – no nested joins)
      const { data: providers } = await supabase
        .from('providers')
        .select('id, business_name')
        .in('id', providerIds);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', providerIds);

      // Create provider lookup map
      const providerMap = new Map();
      providers?.forEach(p => {
        const profile = profiles?.find(prof => prof.id === p.id);
        providerMap.set(p.id, {
          business_name: p.business_name,
          profile: { full_name: profile?.full_name || null },
        });
      });

      // Combine
      const bookingsWithProviders = bookingsData.map(booking => ({
        ...booking,
        provider: providerMap.get(booking.provider_id) || null,
      }));

      setBookings(bookingsWithProviders);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(bookingId: string) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled_by_customer' })
        .eq('id', bookingId);

      if (error) throw error;
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled_by_customer: 'bg-red-100 text-red-800',
    cancelled_by_provider: 'bg-red-100 text-red-800',
    no_show: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Bookings</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled_by_customer">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <NimartSpinner size="md" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-gray-500">{booking.booking_number}</span>
                    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusColors[booking.status])}>
                      {booking.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg">{booking.service_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600">with</span>
                    <Link
                      to={`/provider/${booking.provider_id}`}
                      className="font-medium text-primary-600 hover:underline"
                    >
                      {booking.provider?.business_name || booking.provider?.profile?.full_name || 'Unknown Provider'}
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(booking.booking_date), 'PPP')}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {booking.booking_time} ({booking.duration_minutes} min)
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {booking.location}
                    </div>
                  </div>
                  {booking.special_instructions && (
                    <p className="mt-2 text-sm text-gray-500 italic">"{booking.special_instructions}"</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => cancelBooking(booking.id)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      title="Cancel"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  )}
                  {booking.status === 'completed' && (
                    <Link
                      to={`/provider/${booking.provider_id}?review=true`}
                      className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm"
                    >
                      <Star className="h-4 w-4" />
                      Leave Review
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}