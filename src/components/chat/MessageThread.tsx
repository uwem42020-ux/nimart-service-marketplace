// src/components/chat/MessageThread.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Send } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export function MessageThread() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['thread', threadId],
    queryFn: async () => {
      if (!threadId || !user) return null;

      const { data: threadData } = await supabase
        .from('threads')
        .select('*')
        .eq('id', threadId)
        .single();
      if (!threadData) return null;

      const otherId = threadData.provider_id === user.id
        ? threadData.customer_id
        : threadData.provider_id;

      const [{ data: messagesData }, { data: profileData }] = await Promise.all([
        supabase.from('messages').select('*').eq('thread_id', threadId).order('created_at', { ascending: true }),
        supabase.from('profiles').select('full_name, avatar_url').eq('id', otherId).single(),
      ]);

      return {
        thread: threadData,
        otherParticipant: profileData ?? { full_name: 'Unknown', avatar_url: null },
        messages: (messagesData || []) as Message[],
      };
    },
    enabled: !!threadId && !!user,
    staleTime: 0,
  });

  // Real‑time subscription for incoming messages
  useEffect(() => {
    if (!threadId) return;
    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${threadId}` },
        (payload) => {
          queryClient.setQueryData(['thread', threadId], (old: any) => {
            if (!old) return old;
            return { ...old, messages: [...old.messages, payload.new] };
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel).catch(console.warn); };
  }, [threadId, queryClient]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || !user || !data?.thread) return;

    // Optimistically clear the input immediately
    setNewMessage('');
    setSending(true);

    const recipient = data.thread.provider_id === user.id
      ? data.thread.customer_id
      : data.thread.provider_id;

    try {
      await supabase.from('messages').insert({
        thread_id: data.thread.id,
        sender_id: user.id,
        recipient_id: recipient,
        content,
      } as any);

      // Update the thread's last_message so the list page shows it
      await supabase
        .from('threads')
        .update({ last_message: content, last_message_at: new Date().toISOString() } as any)
        .eq('id', data.thread.id);

      // Invalidate both provider & customer thread lists (both sides)
      queryClient.invalidateQueries({ queryKey: ['provider-threads', data.thread.provider_id] });
      queryClient.invalidateQueries({ queryKey: ['customer-threads', data.thread.customer_id] });

      // Refresh the current thread view to show the new message
      await refetch();
    } catch (err) {
      // If something goes wrong, restore the input
      setNewMessage(content);
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages]);

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin h-10 w-10 border-2 border-primary-600 border-t-transparent rounded-full" /></div>;
  if (!data) return <div className="text-center py-8 text-gray-500">Conversation not found.</div>;

  const { otherParticipant, messages } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="h-5 w-5" /></button>
        {otherParticipant?.avatar_url ? (
          <img src={otherParticipant.avatar_url} className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-medium">{otherParticipant?.full_name?.[0] || '?'}</span>
          </div>
        )}
        <h1 className="text-xl font-semibold">{otherParticipant?.full_name || 'Chat'}</h1>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 space-y-2">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg: Message) => (
            <div key={msg.id} className={cn('flex', msg.sender_id === user?.id ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[70%] rounded-lg px-4 py-2 text-sm', msg.sender_id === user?.id ? 'bg-primary-600 text-white' : 'bg-white border')}>
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <span className="text-xs opacity-70 block mt-1">{format(new Date(msg.created_at), 'p')}</span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="mt-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border rounded-lg"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Send className="h-5 w-5" /> Send
        </button>
      </form>
    </div>
  );
}