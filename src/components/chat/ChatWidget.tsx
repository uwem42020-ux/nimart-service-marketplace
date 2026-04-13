import { useState, useEffect, useRef, memo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { MessageCircle, X, Send } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

const WidgetMessageBubble = memo(({ msg, isOwn }: { msg: any; isOwn: boolean }) => (
  <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
    <div
      className={cn(
        'max-w-[80%] rounded-lg px-3 py-2 text-sm',
        isOwn ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'
      )}
    >
      <p>{msg.content}</p>
      <span className="text-xs opacity-70 block mt-1">{format(new Date(msg.created_at), 'p')}</span>
    </div>
  </div>
));

interface ChatWidgetProps {
  recipientId: string;
  recipientName: string;
  bookingId?: string;
  className?: string;
}

export const ChatWidget = memo(function ChatWidget({ recipientId, recipientName, bookingId, className }: ChatWidgetProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [thread, setThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMarkedRef = useRef(false);

  useEffect(() => {
    if (!user || !isOpen) return;
    getOrCreateThread();
  }, [user, isOpen, recipientId]);

  // Reset mark ref when widget closes or thread changes
  useEffect(() => {
    if (!isOpen) hasMarkedRef.current = false;
  }, [isOpen, thread]);

  // Auto‑mark messages as read when widget opens (runs once per open session)
  useEffect(() => {
    if (!user || !thread || !isOpen) return;
    if (hasMarkedRef.current) return;

    const markAsRead = async () => {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('thread_id', thread.id)
        .eq('recipient_id', user.id)
        .eq('is_read', false);
      hasMarkedRef.current = true;
      // ✅ Force refresh of header badge counts
      queryClient.invalidateQueries({ queryKey: ['notification-counts'] });
    };

    markAsRead();
  }, [user, thread, isOpen, queryClient]);

  useEffect(() => {
    if (!thread) return;
    fetchMessages();
    const channel = supabase
      .channel(`widget-thread-${thread.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${thread.id}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
          scrollToBottom();
        })
      .subscribe();
    return () => { supabase.removeChannel(channel).catch(console.warn); };
  }, [thread]);

  const getOrCreateThread = async () => {
    if (!user) return;
    const providerId = user.id === recipientId ? recipientId : user.id;
    const customerId = user.id === recipientId ? user.id : recipientId;
    const { data: existing } = await supabase
      .from('threads')
      .select('*')
      .or(`and(provider_id.eq.${providerId},customer_id.eq.${customerId})`)
      .maybeSingle();
    if (existing) setThread(existing);
    else {
      const { data: newThread } = await supabase
        .from('threads')
        .insert({ provider_id: providerId, customer_id: customerId, booking_id: bookingId, created_by: user.id })
        .select().single();
      if (newThread) setThread(newThread);
    }
  };

  const fetchMessages = async () => {
    if (!thread) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: true });
    setMessages(data || []);
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
    });
    if (!error) {
      setNewMessage('');
      supabase.from('threads').update({ last_message: newMessage.trim(), last_message_at: new Date().toISOString() }).eq('id', thread.id);
    }
    setLoading(false);
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className={cn('fixed bottom-4 right-4 z-50', className)}>
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="bg-primary-600 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 transition">
          <MessageCircle className="h-6 w-6" />
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl border w-80 sm:w-96 h-96 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold text-gray-900 truncate">{recipientName}</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map(msg => <WidgetMessageBubble key={msg.id} msg={msg} isOwn={msg.sender_id === user?.id} />)}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="p-3 border-t flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded-lg"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !newMessage.trim()} className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
});