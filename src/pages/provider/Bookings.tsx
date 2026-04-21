import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { NimartSpinner } from '../../components/common/NimartSpinner';

interface Booking {
  id: string;
  booking_number: string;
  customer_id: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  location: string;
  special_instructions: string | null;
  status: string;
  created_at: string;
  customer: {
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
  };
}

export default function ProviderBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (user) fetchBookings();
  }, [user, filterStatus]);

  async function fetchBookings() {
    setLoading(true);
    let query = supabase
      .from('bookings')
      .select(`
        *,
        customer:customer_id(full_name, phone, avatar_url)
      `)
      .eq('provider_id', user!.id)
      .order('booking_date', { ascending: true })
      .order('booking_time', { ascending: true });

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    const { data } = await query;
    setBookings(data || []);
    setLoading(false);
  }

  async function updateBookingStatus(bookingId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      toast.success(`Booking ${newStatus}`);
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
        <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
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
          <option value="cancelled_by_customer">Cancelled by Customer</option>
          <option value="cancelled_by_provider">Cancelled by Provider</option>
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
                    <p className="mt-2 text-sm text-gray-500">{booking.special_instructions}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Customer Info */}
                  <div className="text-right">
                    <p className="font-medium">{booking.customer?.full_name}</p>
                    <p className="text-sm text-gray-500">{booking.customer?.phone}</p>
                  </div>

                  {/* Action Buttons */}
                  {booking.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        title="Accept"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'cancelled_by_provider')}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        title="Decline"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'in_progress')}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm"
                    >
                      Start Service
                    </button>
                  )}
                  {booking.status === 'in_progress' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                    >
                      Mark Completed
                    </button>
                  )}
                  {booking.status === 'completed' && (
                    <span className="text-green-600 text-sm font-medium">✓ Completed</span>
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