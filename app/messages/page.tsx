// app/messages/page.tsx - FINAL FINAL WORKING VERSION
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ensureUserProfile, ensureMultipleProfiles } from '@/lib/profile-sync'
import { 
  MessageSquare, Send, Search, User, 
  ArrowLeft, Check, CheckCheck,
  MoreVertical, Image as ImageIcon, Paperclip,
  Smile, Phone, Video, Loader2,
  Briefcase, RefreshCw, Plus
} from 'lucide-react'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
  sender_display_name?: string
  receiver_display_name?: string
  sender_user_type?: string
  receiver_user_type?: string
}

interface Conversation {
  userId: string
  userDisplayName: string
  userEmail: string
  userAvatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline: boolean
  userType: 'customer' | 'provider' | 'unknown'
  providerId?: string
}

export default function MessagesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userType, setUserType] = useState<'customer' | 'provider' | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [initialLoad, setInitialLoad] = useState(true)
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const realtimeChannelRef = useRef<any>(null)

  // WORKING REALTIME SUBSCRIPTION
  const setupRealtimeSubscription = useCallback((userId: string) => {
    console.log('🔌 Setting up realtime for user:', userId)
    
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current)
    }

    const channel = supabase
      .channel(`messages-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload: any) => {
          const newMsg = payload.new
          console.log('📬 Realtime message:', {
            id: newMsg.id,
            from: newMsg.sender_id,
            to: newMsg.receiver_id,
            currentUser: userId
          })
          
          setRealtimeConnected(true)
          
          if (newMsg.receiver_id === userId || newMsg.sender_id === userId) {
            console.log('🔄 Reloading for current user')
            await loadConversations(userId)
            
            if (selectedConversation && 
                (newMsg.sender_id === selectedConversation || 
                 newMsg.receiver_id === selectedConversation)) {
              await loadMessagesWithUser(userId, selectedConversation)
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime status:', status)
        setRealtimeConnected(status === 'SUBSCRIBED')
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime connected')
        }
      })

    realtimeChannelRef.current = channel
  }, [selectedConversation, user])

  // Check auth and load messages
  useEffect(() => {
    checkAuthAndLoadMessages()
    
    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current)
      }
    }
  }, [])

  const checkAuthAndLoadMessages = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/login')
        return
      }
      
      setUser(session.user)
      setUserType(session.user.user_metadata?.user_type || 'customer')
      
      await ensureUserProfile(session.user.id)
      await loadConversations(session.user.id)
      setupRealtimeSubscription(session.user.id)
      
    } catch (error) {
      console.error('Error loading messages:', error)
      router.push('/login')
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }

  // Load conversations
  const loadConversations = async (userId: string) => {
    try {
      console.log('📥 Loading conversations for user:', userId)
      
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading messages:', error)
        setConversations([])
        return
      }

      if (!messagesData || messagesData.length === 0) {
        console.log('📭 No messages found')
        setConversations([])
        return
      }

      const userIds = new Set<string>()
      messagesData.forEach(msg => {
        if (msg.sender_id !== userId) userIds.add(msg.sender_id)
        if (msg.receiver_id !== userId) userIds.add(msg.receiver_id)
      })

      await ensureMultipleProfiles(Array.from(userIds))

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, user_type, provider_id, avatar_url')
        .in('user_id', Array.from(userIds))

      const profilesMap = new Map()
      profiles?.forEach(profile => {
        profilesMap.set(profile.user_id, profile)
      })

      const conversationsList: Conversation[] = []
      
      for (const otherUserId of Array.from(userIds)) {
        const userMessages = messagesData.filter(msg => 
          msg.sender_id === otherUserId || msg.receiver_id === otherUserId
        )
        
        const lastMessage = userMessages[0]
        const unreadCount = userMessages.filter(msg => 
          msg.receiver_id === userId && !msg.is_read
        ).length

        const profile = profilesMap.get(otherUserId)

        conversationsList.push({
          userId: otherUserId,
          userDisplayName: profile?.display_name || 'User',
          userEmail: profile?.email || '',
          userAvatar: profile?.avatar_url,
          userType: (profile?.user_type as 'customer' | 'provider') || 'unknown',
          providerId: profile?.provider_id,
          lastMessage: lastMessage.content.substring(0, 100) + (lastMessage.content.length > 100 ? '...' : ''),
          lastMessageTime: lastMessage.created_at,
          unreadCount,
          isOnline: false
        })
      }

      const sortedConversations = conversationsList.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      )

      setConversations(sortedConversations)

      if (sortedConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(sortedConversations[0].userId)
        await loadMessagesWithUser(userId, sortedConversations[0].userId)
      }

    } catch (error) {
      console.error('Error loading conversations:', error)
      setConversations([])
    }
  }

  // Load messages with user
  const loadMessagesWithUser = async (currentUserId: string, otherUserId: string) => {
    try {
      console.log(`📨 Loading messages between ${currentUserId} and ${otherUserId}`)
      
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading messages:', error)
        setMessages([])
        return
      }

      if (!messagesData || messagesData.length === 0) {
        console.log('No messages found')
        setMessages([])
        return
      }

      const filteredMessages = messagesData.filter(msg =>
        (msg.sender_id === currentUserId && msg.receiver_id === otherUserId) ||
        (msg.sender_id === otherUserId && msg.receiver_id === currentUserId)
      )

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, user_type')
        .in('user_id', [currentUserId, otherUserId])

      const profilesMap = new Map()
      profiles?.forEach(profile => {
        profilesMap.set(profile.user_id, {
          display_name: profile.display_name,
          user_type: profile.user_type
        })
      })

      const formattedMessages: Message[] = filteredMessages.map((msg: any) => {
        const senderProfile = profilesMap.get(msg.sender_id)
        const receiverProfile = profilesMap.get(msg.receiver_id)
        
        return {
          id: msg.id,
          sender_id: msg.sender_id,
          receiver_id: msg.receiver_id,
          content: msg.content,
          is_read: msg.is_read,
          created_at: msg.created_at,
          sender_display_name: senderProfile?.display_name || 'User',
          receiver_display_name: receiverProfile?.display_name || 'User',
          sender_user_type: senderProfile?.user_type || 'customer',
          receiver_user_type: receiverProfile?.user_type || 'customer'
        }
      })

      console.log(`✅ Loaded ${formattedMessages.length} messages`)
      setMessages(formattedMessages)

      try {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('receiver_id', currentUserId)
          .eq('sender_id', otherUserId)
          .eq('is_read', false)
      } catch (error) {
        console.log('Error marking as read:', error)
      }

      setConversations(prev =>
        prev.map(conv =>
          conv.userId === otherUserId ? { ...conv, unreadCount: 0 } : conv
        )
      )

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)

    } catch (error) {
      console.error('Error loading messages:', error)
      setMessages([])
    }
  }

  // SEND MESSAGE - ONLY COLUMNS THAT ACTUALLY EXIST
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedConversation || sending) return

    try {
      setSending(true)
      
      // Optimistic update
      const tempId = `temp-${Date.now()}`
      const optimisticMessage: Message = {
        id: tempId,
        sender_id: user.id,
        receiver_id: selectedConversation,
        content: newMessage.trim(),
        is_read: false,
        created_at: new Date().toISOString(),
        sender_display_name: 'You',
        receiver_display_name: conversations.find(c => c.userId === selectedConversation)?.userDisplayName || 'User'
      }

      setMessages(prev => [...prev, optimisticMessage])
      setNewMessage('')

      // SIMPLE INSERT - ONLY COLUMNS THAT EXIST IN YOUR TABLE
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedConversation,
          content: newMessage.trim(),
          is_read: false
          // DO NOT include 'topic' or 'extension' - they don't exist!
          // Only include: sender_id, receiver_id, content, is_read
          // Optional: payload, event, private
        })

      if (error) {
        console.error('❌ Send failed:', error)
        console.error('Error details:', error.message)
        
        // Try even simpler insert
        const { error: simpleError } = await supabase
          .from('messages')
          .insert({
            sender_id: user.id,
            receiver_id: selectedConversation,
            content: newMessage.trim()
          })
          
        if (simpleError) {
          setMessages(prev => prev.filter(msg => msg.id !== tempId))
          alert('Failed to send message: ' + simpleError.message)
          return
        }
        
        console.log('✅ Message sent with simple insert')
      } else {
        console.log('✅ Message sent!')
      }
      
      // Auto-reload after sending
      setTimeout(async () => {
        console.log('🔄 Auto-reloading messages...')
        if (user && selectedConversation) {
          await loadMessagesWithUser(user.id, selectedConversation)
          await loadConversations(user.id)
        }
      }, 1000)

      // Update conversation list
      setConversations(prev => {
        const updated = prev.map(conv =>
          conv.userId === selectedConversation
            ? {
                ...conv,
                lastMessage: newMessage.substring(0, 100) + (newMessage.length > 100 ? '...' : ''),
                lastMessageTime: new Date().toISOString()
              }
            : conv
        )
        
        return updated.sort((a, b) => 
          new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        )
      })

      // Scroll
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)

    } catch (error) {
      console.error('Error:', error)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    if (user) {
      await loadConversations(user.id)
      if (selectedConversation) {
        await loadMessagesWithUser(user.id, selectedConversation)
      }
    }
    setLoading(false)
  }

  const filteredConversations = conversations.filter(conv =>
    conv.userDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedUser = selectedConversation
    ? conversations.find(c => c.userId === selectedConversation)
    : null

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    userType === 'provider' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {userType === 'provider' ? (
                      <>
                        <Briefcase className="h-3 w-3 mr-1" />
                        Business Account
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3 mr-1" />
                        Customer Account
                      </>
                    )}
                  </span>
                  {realtimeConnected && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                      Live
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                title="Refresh messages"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row h-[calc(100vh-180px)] bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Conversations List */}
          <div className="lg:w-1/3 border-r overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.userId}
                    onClick={() => {
                      setSelectedConversation(conversation.userId)
                      if (user) {
                        loadMessagesWithUser(user.id, conversation.userId)
                      }
                    }}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      selectedConversation === conversation.userId
                        ? 'bg-primary/5 border-l-4 border-primary'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                          conversation.userType === 'provider'
                            ? 'bg-gradient-to-br from-green-500 to-green-600'
                            : 'bg-gradient-to-br from-blue-500 to-blue-600'
                        }`}>
                          {conversation.userDisplayName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conversation.userDisplayName}
                            </h3>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDate(conversation.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <div className="mt-2">
                            <span className="inline-block px-2 py-0.5 bg-red-600 text-white text-xs rounded-full font-bold">
                              {conversation.unreadCount} unread
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:w-2/3 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                      selectedUser?.userType === 'provider'
                        ? 'bg-gradient-to-br from-green-500 to-green-600'
                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      {selectedUser?.userDisplayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {selectedUser?.userDisplayName || 'User'}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {realtimeConnected ? 'Online' : 'Last seen recently'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No messages yet. Start a conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.sender_id === user?.id
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              isOwnMessage
                                ? 'bg-primary text-white rounded-br-none'
                                : 'bg-gray-100 text-gray-900 rounded-bl-none'
                            }`}
                          >
                            <div className="mb-1">
                              <span className="text-xs font-semibold">
                                {isOwnMessage ? 'You' : message.sender_display_name}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center justify-end mt-1 ${
                              isOwnMessage ? 'text-white/80' : 'text-gray-500'
                            }`}>
                              <span className="text-xs">
                                {formatTime(message.created_at)}
                              </span>
                              {isOwnMessage && (
                                <span className="ml-2">
                                  {message.is_read ? (
                                    <CheckCheck className="h-3 w-3" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={sending}
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      className={`px-4 py-3 rounded-full font-medium ${
                        newMessage.trim() && !sending
                          ? 'bg-primary text-white hover:bg-green-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {sending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}