// src/components/chat/ChatWidget.tsx
import { useState, useEffect, useRef } from 'react';
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

interface ChatWidgetProps {
  recipientId: string;
  recipientName: string;
  bookingId?: string;
  className?: string;
}

export const ChatWidget = ({ recipientId, recipientName, bookingId, className }: ChatWidgetProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const fetchMessages = async (tid: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', tid)
      .order('created_at', { ascending: true });
    // Use a set to remove any potential duplicates in the fetched data
    const uniqueById = new Map<string, Message>();
    (data || []).forEach((msg: any) => {
      uniqueById.set(msg.id, msg as Message);
    });
    const uniqueMessages = Array.from(uniqueById.values());
    setMessages(uniqueMessages);
    scrollToBottom();
  };

  // Bootstrap thread when widget opens
  useEffect(() => {
    if (!user || !isOpen) return;
    (async () => {
      const providerId = user.id === recipientId ? recipientId : user.id;
      const customerId = user.id === recipientId ? user.id : recipientId;
      const { data: existing } = await supabase
        .from('threads')
        .select('id')
        .or(`and(provider_id.eq.${providerId},customer_id.eq.${customerId})`)
        .maybeSingle();
      if (existing) {
        setThreadId(existing.id);
      } else {
        const { data: newThread } = await supabase
          .from('threads')
          .insert({
            provider_id: providerId,
            customer_id: customerId,
            booking_id: bookingId,
            created_by: user.id,
          } as any)
          .select('id')
          .single();
        if (newThread) setThreadId(newThread.id);
      }
    })();
  }, [user, isOpen, recipientId]);

  // Fetch messages and subscribe to real‑time
  useEffect(() => {
    if (!threadId) return;
    fetchMessages(threadId);

    const channel = supabase
      .channel(`widget-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          scrollToBottom();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel).catch(console.warn);
    };
  }, [threadId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !threadId) return;
    setLoading(true);
    const content = newMessage.trim();
    const recipient = recipientId;
    try {
      await supabase.from('messages').insert({
        thread_id: threadId,
        sender_id: user.id,
        recipient_id: recipient,
        content,
      } as any);
      // Invalidate the full thread page if open
      queryClient.invalidateQueries({ queryKey: ['thread', threadId] });
      // Refetch messages now – this will include the new message
      await fetchMessages(threadId);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
            <h3 className="font-semibold truncate">{recipientName}</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex', msg.sender_id === user?.id ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                    msg.sender_id === user?.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  <p>{msg.content}</p>
                  <span className="text-xs opacity-70 block mt-1">
                    {format(new Date(msg.created_at), 'p')}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="p-3 border-t flex gap-2">
            <input
              type="text"
              name="chatMessage"
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
};