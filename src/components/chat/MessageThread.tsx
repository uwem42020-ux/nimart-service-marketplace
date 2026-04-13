import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Send } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  isPending?: boolean;
}

const MessageBubble = memo(({ msg, isOwn }: { msg: Message; isOwn: boolean }) => (
  <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
    <div
      className={cn(
        'max-w-[70%] rounded-lg px-4 py-2 transition-opacity',
        msg.isPending ? 'opacity-70' : 'opacity-100',
        isOwn ? 'bg-primary-600 text-white' : 'bg-white border text-gray-900'
      )}
    >
      <p>{msg.content}</p>
      <span className="text-xs opacity-70 block mt-1">
        {format(new Date(msg.created_at), 'p')}
        {msg.isPending && ' • Sending...'}
      </span>
    </div>
  </div>
));

export function MessageThread() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasMarkedRef = useRef(false);

  const { data, isLoading } = useQuery({
    queryKey: ['thread', threadId],
    queryFn: async () => {
      if (!threadId || !user) return null;

      const [threadRes, messagesRes] = await Promise.all([
        supabase.from('threads').select('*').eq('id', threadId).single(),
        supabase.from('messages').select('*').eq('thread_id', threadId).order('created_at', { ascending: true })
      ]);

      if (threadRes.error || !threadRes.data) return null;

      const otherId = threadRes.data.provider_id === user.id ? threadRes.data.customer_id : threadRes.data.provider_id;
      const profileRes = await supabase.from('profiles').select('id, full_name, avatar_url').eq('id', otherId).single();

      return {
        thread: threadRes.data,
        otherParticipant: profileRes.data,
        messages: messagesRes.data || [],
      };
    },
    enabled: !!threadId && !!user,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Reset the mark ref when thread changes
  useEffect(() => {
    hasMarkedRef.current = false;
  }, [threadId]);

  // Auto‑mark messages as read when thread is opened (runs once per thread visit)
  useEffect(() => {
    if (!user || !data?.thread) return;
    if (hasMarkedRef.current) return;

    const markAsRead = async () => {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('thread_id', data.thread.id)
        .eq('recipient_id', user.id)
        .eq('is_read', false);
      hasMarkedRef.current = true;
      // ✅ Force refresh of header badge counts
      queryClient.invalidateQueries({ queryKey: ['notification-counts'] });
    };

    markAsRead();
  }, [user, data?.thread, queryClient]);

  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !data?.thread || isSending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    inputRef.current?.focus();

    const recipientId = data.thread.provider_id === user.id ? data.thread.customer_id : data.thread.provider_id;
    
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      content,
      sender_id: user.id,
      created_at: new Date().toISOString(),
      is_read: false,
      isPending: true,
    };

    queryClient.setQueryData(['thread', threadId], (old: any) => {
      if (!old) return old;
      return { ...old, messages: [...old.messages, optimisticMsg] };
    });
    scrollToBottom();

    try {
      const { error } = await supabase.from('messages').insert({
        thread_id: data.thread.id,
        sender_id: user.id,
        recipient_id: recipientId,
        content,
      });

      if (error) throw error;

      supabase
        .from('threads')
        .update({ last_message: content, last_message_at: new Date().toISOString() })
        .eq('id', data.thread.id)
        .then(({ error }) => { if (error) console.warn('Failed to update thread last_message:', error); });

    } catch (error: any) {
      queryClient.setQueryData(['thread', threadId], (old: any) => {
        if (!old) return old;
        return { ...old, messages: old.messages.filter((m: Message) => m.id !== optimisticMsg.id) };
      });
      toast.error('Failed to send message. Please retry.');
      setNewMessage(content);
    } finally {
      setIsSending(false);
    }
  }, [newMessage, user, data, threadId, queryClient, isSending]);

  useEffect(() => {
    if (!threadId || !user) return;

    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${threadId}` },
        (payload) => {
          const newMsg = payload.new as Message;
          queryClient.setQueryData(['thread', threadId], (old: any) => {
            if (!old) return old;
            const filtered = old.messages.filter((m: Message) => 
              !(m.isPending && m.content === newMsg.content && m.sender_id === newMsg.sender_id)
            );
            return { ...old, messages: [...filtered, newMsg] };
          });

          if (newMsg.recipient_id === user.id) {
            supabase.from('messages').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', newMsg.id);
            queryClient.invalidateQueries({ queryKey: ['notification-counts'] });
          }
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch(console.warn);
    };
  }, [threadId, user, queryClient]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (data?.messages.length) scrollToBottom();
  }, [data?.messages.length, scrollToBottom]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Conversation not found.</p>
      </div>
    );
  }

  const { otherParticipant, messages } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </button>
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
            <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender_id === user?.id} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="mt-4 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || isSending}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 transition"
        >
          <Send className="h-5 w-5" />
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}