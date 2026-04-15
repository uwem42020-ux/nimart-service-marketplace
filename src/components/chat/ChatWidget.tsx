// src/components/chat/ChatWidget.tsx
import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { MessageCircle, X, Send } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
}

interface Thread {
  id: string;
}

const WidgetMessageBubble = memo(({ msg, isOwn }: { msg: Message; isOwn: boolean }) => (
  <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
    <div
      className={cn(
        'max-w-[80%] rounded-lg px-3 py-2 text-sm',
        isOwn ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'
      )}
    >
      <p>{msg.content}</p>
      <span className="text-xs opacity-70 block mt-1">
        {format(new Date(msg.created_at), 'p')}
      </span>
    </div>
  </div>
));

interface ChatWidgetProps {
  recipientId: string;
  recipientName: string;
  bookingId?: string;
  className?: string;
}

export const ChatWidget = memo(function ChatWidget({
  recipientId,
  recipientName,
  bookingId,
  className,
}: ChatWidgetProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMarkedInitialRef = useRef(false);

  useEffect(() => {
    if (!user || !isOpen) return;
    getOrCreateThread();
  }, [user, isOpen, recipientId]);

  const markThreadAsRead = useCallback(async () => {
    if (!user || !thread) return;
    await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() } as any)
      .eq('thread_id', thread.id)
      .eq('recipient_id', user.id)
      .eq('is_read', false);
    queryClient.invalidateQueries({ queryKey: ['notification-counts'] });
  }, [user, thread, queryClient]);

  useEffect(() => {
    if (thread && isOpen && !hasMarkedInitialRef.current) {
      markThreadAsRead();
      hasMarkedInitialRef.current = true;
    }
  }, [thread, isOpen, markThreadAsRead]);

  useEffect(() => {
    if (!isOpen) {
      hasMarkedInitialRef.current = false;
    }
  }, [isOpen, thread]);

  useEffect(() => {
    if (!isOpen) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && thread) {
        markThreadAsRead();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isOpen, thread, markThreadAsRead]);

  useEffect(() => {
    if (!thread) return;
    fetchMessages();
    const channel = supabase
      .channel(`widget-thread-${thread.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${thread.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          scrollToBottom();
          if (newMsg.recipient_id === user?.id && isOpen) {
            supabase
              .from('messages')
              .update({ is_read: true, read_at: new Date().toISOString() } as any)
              .eq('id', newMsg.id);
            queryClient.invalidateQueries({ queryKey: ['notification-counts'] });
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel).catch(console.warn);
    };
  }, [thread, isOpen, user, queryClient]);

  const getOrCreateThread = async () => {
    if (!user) return;
    const providerId = user.id === recipientId ? recipientId : user.id;
    const customerId = user.id === recipientId ? user.id : recipientId;
    const { data: existing } = await supabase
      .from('threads')
      .select('*')
      .or(`and(provider_id.eq.${providerId},customer_id.eq.${customerId})`)
      .maybeSingle();
    if (existing) setThread(existing as Thread);
    else {
      const { data: newThread } = await supabase
        .from('threads')
        .insert({
          provider_id: providerId,
          customer_id: customerId,
          booking_id: bookingId,
          created_by: user.id,
        } as any)
        .select()
        .single();
      if (newThread) setThread(newThread as Thread);
    }
  };

  const fetchMessages = async () => {
    if (!thread) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: true });
    setMessages((data || []) as Message[]);
    scrollToBottom();
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !thread) return;
    setLoading(true);
    const recipient = recipientId;
    const { error } = await supabase.from('messages').insert({
      thread_id: thread.id,
      sender_id: user.id,
      recipient_id: recipient,
      content: newMessage.trim(),
    } as any);
    if (!error) {
      setNewMessage('');
      supabase
        .from('threads')
        .update({ last_message: newMessage.trim(), last_message_at: new Date().toISOString() } as any)
        .eq('id', thread.id);
    }
    setLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={cn('fixed bottom-4 right-4 z-50', className)}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 transition"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl border w-80 sm:w-96 h-96 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold text-gray-900 truncate">{recipientName}</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg) => (
              <WidgetMessageBubble key={msg.id} msg={msg} isOwn={msg.sender_id === user?.id} />
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="p-3 border-t flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded-lg"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
});