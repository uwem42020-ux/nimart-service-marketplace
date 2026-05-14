// src/pages/provider/Messages.tsx
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { MessageCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { NimartSpinner } from '../../components/common/NimartSpinner';

export default function ProviderMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: threads, isLoading, refetch } = useQuery({
    queryKey: ['provider-threads', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: threadData } = await supabase
        .from('threads')
        .select('id, provider_id, customer_id, last_message, last_message_at')
        .or(`provider_id.eq.${user.id},customer_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      console.log('[ProviderMessages] fetched threads:', threadData);

      if (!threadData?.length) return [];

      // Collect all unique other-user IDs
      const otherIds = threadData.map((t) => t.provider_id === user.id ? t.customer_id : t.provider_id);
      const uniqueIds = [...new Set(otherIds)];

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', uniqueIds);

      const profileMap = new Map(profilesData?.map((p) => [p.id, p]));

      return threadData.map((t) => {
        const otherId = t.provider_id === user.id ? t.customer_id : t.provider_id;
        return {
          id: t.id,
          last_message: t.last_message || 'No messages yet',
          last_message_at: t.last_message_at,
          other_participant: profileMap.get(otherId) || {
            full_name: 'Unknown User',
            avatar_url: null,
          },
        };
      });
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Real‑time: listen to both provider and customer changes
  useEffect(() => {
    if (!user) return;

    // Channel for threads where user is provider
    const channelProvider = supabase
      .channel('provider-threads-provider')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'threads', filter: `provider_id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ['provider-threads', user.id] })
      )
      .subscribe();

    // Channel for threads where user is customer
    const channelCustomer = supabase
      .channel('provider-threads-customer')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'threads', filter: `customer_id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ['provider-threads', user.id] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelProvider).catch(console.warn);
      supabase.removeChannel(channelCustomer).catch(console.warn);
    };
  }, [user, queryClient]);

  if (isLoading) return <div className="flex justify-center py-12"><NimartSpinner size="md" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {!threads?.length ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">No conversations yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => (
            <Link
              key={t.id}
              to={`/provider/messages/${t.id}`}
              className="block bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                {t.other_participant.avatar_url ? (
                  <img src={t.other_participant.avatar_url} className="w-10 h-10 rounded-full" alt="" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {t.other_participant.full_name?.[0] || '?'}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{t.other_participant.full_name}</p>
                  <p className="text-sm text-gray-500 truncate">{t.last_message}</p>
                </div>
                {t.last_message_at && (
                  <span className="text-xs text-gray-400">
                    {format(new Date(t.last_message_at), 'MMM d')}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}