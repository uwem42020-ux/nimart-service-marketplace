import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, User, Briefcase, Shield, QRCode } from 'lucide-react';
import { NimartSpinner } from '../../components/common/NimartSpinner';

export default function BookingReceipt() {
  const { token } = useParams<{ token: string }>();

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking-receipt', token],
    queryFn: async () => {
      if (!token) return null;
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          provider:provider_id(business_name),
          customer_profile:customer_id(full_name, phone),
          provider_profile:provider_id(full_name, phone)
        `)
        .eq('receipt_token', token)
        .single();
      return data;
    },
    enabled: !!token,
  });

  if (isLoading) return <div className="flex justify-center py-16"><NimartSpinner size="lg" /></div>;
  if (!booking) return <div className="text-center py-16 text-gray-500">Receipt not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Booking Receipt</h1>
              <p className="text-primary-100 text-sm mt-1">Nimart Service Marketplace</p>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
              <QRCode className="h-16 w-16 mx-auto text-white" />
              <p className="text-[10px] text-primary-100 mt-1">Scan to verify</p>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="p-6 space-y-5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Booking Number</span>
            <span className="text-lg font-bold font-mono text-gray-900">{booking.booking_number}</span>
          </div>

          <hr className="border-gray-100" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <User className="h-3.5 w-3.5" /> Provider
              </div>
              <p className="font-semibold text-gray-900">
                {(booking as any).provider_profile?.full_name || (booking as any).provider?.business_name || 'Provider'}
              </p>
              {(booking as any).provider_profile?.phone && (
                <p className="text-sm text-primary-600">{(booking as any).provider_profile?.phone}</p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <User className="h-3.5 w-3.5" /> Customer
              </div>
              <p className="font-semibold text-gray-900">{(booking as any).customer_profile?.full_name || 'Customer'}</p>
              {(booking as any).customer_profile?.phone && (
                <p className="text-sm text-primary-600">{(booking as any).customer_profile?.phone}</p>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Briefcase className="h-3.5 w-3.5" /> Service
            </div>
            <p className="font-semibold text-gray-900">{booking.service_name}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Calendar className="h-4 w-4 text-primary-500" />
              {format(new Date(booking.booking_date), 'PPP')}
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Clock className="h-4 w-4 text-primary-500" />
              {booking.booking_time} ({booking.duration_minutes} min)
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
              <MapPin className="h-4 w-4 text-primary-500" />
              {booking.location}
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Status</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              {booking.status.replace(/_/g, ' ')}
            </span>
          </div>

          {booking.special_instructions && (
            <>
              <hr className="border-gray-100" />
              <div>
                <div className="text-xs text-gray-500 mb-1">Special Instructions</div>
                <p className="text-sm text-gray-700 italic">{booking.special_instructions}</p>
              </div>
            </>
          )}

          {/* Disclaimer */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-2 mt-4">
            <Shield className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500">
              Nimart connects customers with service providers. Payment and service terms are agreed directly between both parties. 
              Nimart provides dispute mediation but is not responsible for the outcome of individual services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}