import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { NimartSpinner } from '../../components/common/NimartSpinner';

export default function CustomerMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: threads, isLoading } = useQuery({
    queryKey: ['customer-threads', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: threadData } = await supabase
        .from('threads')
        .select('id, provider_id, customer_id')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (!threadData?.length) return [];

      const enriched = await Promise.all(
        threadData.map(async (t) => {
          const { data: latestMsg } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('thread_id', t.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', t.provider_id)
            .single();

          return {
            id: t.id,
            last_message: latestMsg?.content || 'No messages yet',
            last_message_at: latestMsg?.created_at || null,
            other_participant: profile || { full_name: 'Unknown', avatar_url: null },
          };
        })
      );
      return enriched;
    },
    enabled: !!user,
    staleTime: 0,
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('customer-threads-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'threads', filter: `customer_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['customer-threads', user.id] });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        queryClient.invalidateQueries({ queryKey: ['customer-threads', user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  if (isLoading) return <div className="flex justify-center py-12"><NimartSpinner size="md" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      {!threads?.length ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">No conversations yet.</p>
          <Link to="/search" className="mt-2 inline-block text-primary-600 hover:underline">Find a provider to message</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => (
            <Link key={t.id} to={`/customer/messages/${t.id}`} className="block bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition">
              <div className="flex items-center gap-3">
                {t.other_participant.avatar_url ? <img src={t.other_participant.avatar_url} className="w-10 h-10 rounded-full" /> : <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center"><span className="text-primary-600 font-medium">{t.other_participant.full_name?.[0] || '?'}</span></div>}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{t.other_participant.full_name}</p>
                  <p className="text-sm text-gray-500 truncate">{t.last_message}</p>
                </div>
                {t.last_message_at && <span className="text-xs text-gray-400">{format(new Date(t.last_message_at), 'MMM d')}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}