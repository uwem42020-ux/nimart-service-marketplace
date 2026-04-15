import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Send, Paperclip, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  thread_id: string;
  created_at: string;
  is_read: boolean;
  attachment_url?: string | null;
  attachment_type?: string | null;
  isPending?: boolean;
}

interface Thread {
  id: string;
  provider_id: string;
  customer_id: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface ThreadData {
  thread: Thread;
  otherParticipant: Profile;
  messages: Message[];
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
      {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
      {msg.attachment_url && msg.attachment_type?.startsWith('image/') && (
        <img
          src={msg.attachment_url}
          alt="attachment"
          className="mt-2 max-w-full rounded-lg"
          loading="lazy"
        />
      )}
      <span className="text-xs opacity-70 block mt-1">
        {format(new Date(msg.created_at), 'p')}
        {msg.isPending && ' • Sending...'}
      </span>
    </div>
  </div>
));

export function MessageThread() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasMarkedInitialRef = useRef(false);

  const { data, isLoading } = useQuery<ThreadData | null>({
    queryKey: ['thread', threadId],
    queryFn: async () => {
      if (!threadId || !user) return null;

      const [threadRes, messagesRes] = await Promise.all([
        supabase.from('threads').select('*').eq('id', threadId).single(),
        supabase.from('messages').select('*').eq('thread_id', threadId).order('created_at', { ascending: true })
      ]);

      if (threadRes.error || !threadRes.data) return null;

      const otherId = threadRes.data.provider_id === user.id ? threadRes.data.customer_id : threadRes.data.provider_id;
      const profileRes = await supabase.from('profiles').select('*').eq('id', otherId).single();

      return {
        thread: threadRes.data as Thread,
        otherParticipant: (profileRes.data || {}) as Profile,
        messages: (messagesRes.data || []) as Message[],
      };
    },
    enabled: !!threadId && !!user,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const markThreadAsRead = useCallback(async () => {
    if (!user || !data?.thread) return;
    await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() } as any)
      .eq('thread_id', data.thread.id)
      .eq('recipient_id', user.id)
      .eq('is_read', false);
    queryClient.invalidateQueries({ queryKey: ['notification-counts'] });
  }, [user, data?.thread, queryClient]);

  useEffect(() => {
    if (data?.thread && !hasMarkedInitialRef.current) {
      markThreadAsRead();
      hasMarkedInitialRef.current = true;
    }
  }, [data?.thread, markThreadAsRead]);

  useEffect(() => {
    hasMarkedInitialRef.current = false;
  }, [threadId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && data?.thread) {
        markThreadAsRead();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [data?.thread, markThreadAsRead]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let processedFile = file;
      if (file.type.startsWith('image/')) {
        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true };
        processedFile = await imageCompression(file, options);
      }
      setAttachment(processedFile);
      setAttachmentPreview(URL.createObjectURL(processedFile));
    } catch (error) {
      toast.error('Failed to process image');
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !user || !data?.thread || isSending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    inputRef.current?.focus();

    const recipientId = data.thread.provider_id === user.id ? data.thread.customer_id : data.thread.provider_id;

    // Upload attachment if present
    let attachmentUrl: string | null = null;
    let attachmentType: string | null = null;
    if (attachment) {
      const fileExt = attachment.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, attachment);
      if (uploadError) {
        toast.error('Failed to upload attachment');
        setIsSending(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('chat-attachments').getPublicUrl(fileName);
      attachmentUrl = urlData.publicUrl;
      attachmentType = attachment.type;
    }

    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      content,
      sender_id: user.id,
      recipient_id: recipientId,
      thread_id: data.thread.id,
      created_at: new Date().toISOString(),
      is_read: false,
      attachment_url: attachmentPreview ? attachmentPreview : attachmentUrl,
      attachment_type: attachmentType,
      isPending: true,
    };

    queryClient.setQueryData(['thread', threadId], (old: ThreadData | null) => {
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
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
      } as any);

      if (error) throw error;

      supabase
        .from('threads')
        .update({ last_message: content || '📎 Attachment', last_message_at: new Date().toISOString() } as any)
        .eq('id', data.thread.id)
        .then(({ error }) => { if (error) console.warn('Failed to update thread last_message:', error); });

      // Clear attachment state
      setAttachment(null);
      setAttachmentPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      queryClient.setQueryData(['thread', threadId], (old: ThreadData | null) => {
        if (!old) return old;
        return { ...old, messages: old.messages.filter((m: Message) => m.id !== optimisticMsg.id) };
      });
      toast.error('Failed to send message. Please retry.');
      setNewMessage(content);
    } finally {
      setIsSending(false);
    }
  }, [newMessage, attachment, user, data, threadId, queryClient, isSending, attachmentPreview]);

  useEffect(() => {
    if (!threadId || !user) return;

    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${threadId}` },
        (payload) => {
          const newMsg = payload.new as Message;
          queryClient.setQueryData(['thread', threadId], (old: ThreadData | null) => {
            if (!old) return old;
            const filtered = old.messages.filter((m: Message) =>
              !(m.isPending && m.content === newMsg.content && m.sender_id === newMsg.sender_id)
            );
            return { ...old, messages: [...filtered, newMsg] };
          });

          if (newMsg.recipient_id === user.id) {
            supabase.from('messages').update({ is_read: true, read_at: new Date().toISOString() } as any).eq('id', newMsg.id);
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
          messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender_id === user?.id} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="mt-4 space-y-2">
        {attachmentPreview && (
          <div className="relative inline-block">
            <img src={attachmentPreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border" />
            <button
              type="button"
              onClick={removeAttachment}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isSending}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            disabled={isSending}
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <button
            type="submit"
            disabled={(!newMessage.trim() && !attachment) || isSending}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 transition"
          >
            <Send className="h-5 w-5" />
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}