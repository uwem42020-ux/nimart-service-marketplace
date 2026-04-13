import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect } from 'react';

export default function CustomerMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: threads, isLoading } = useQuery({
    queryKey: ['customer-threads', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: threadData } = await supabase
        .from('threads')
        .select(`
          id,
          provider_id,
          customer_id,
          last_message,
          last_message_at
        `)
        .eq('customer_id', user.id)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (!threadData) return [];

      const providerIds = threadData.map(t => t.provider_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', providerIds);

      return threadData.map(thread => ({
        ...thread,
        other_participant: profiles?.find(p => p.id === thread.provider_id) || { full_name: 'Unknown', avatar_url: null },
      }));
    },
    enabled: !!user,
    staleTime: Infinity,
  });

  // Subscribe to thread updates (new messages, last_message changes)
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('customer-threads-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'threads', filter: `customer_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['customer-threads', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : threads?.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">No conversations yet.</p>
          <Link to="/search" className="mt-2 inline-block text-primary-600 hover:underline">
            Find a provider to message
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {threads?.map((thread) => (
            <Link
              key={thread.id}
              to={`/customer/messages/${thread.id}`}
              className="block bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                {thread.other_participant.avatar_url ? (
                  <img src={thread.other_participant.avatar_url} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {thread.other_participant.full_name?.[0] || '?'}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{thread.other_participant.full_name}</p>
                  <p className="text-sm text-gray-500 truncate">{thread.last_message || 'No messages yet'}</p>
                </div>
                {thread.last_message_at && (
                  <span className="text-xs text-gray-400">
                    {format(new Date(thread.last_message_at), 'MMM d')}
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