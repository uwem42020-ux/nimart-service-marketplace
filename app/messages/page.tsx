// app/messages/page.tsx - FIXED MOBILE LAYOUT
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ensureUserProfile, ensureMultipleProfiles } from '@/lib/profile-sync'
import { 
  MessageSquare, Send, Search, User, 
  ArrowLeft, Check, CheckCheck,
  MoreVertical, Phone, Loader2,
  Briefcase, RefreshCw,
  X, ChevronLeft, Home
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
  sender_provider_id?: string
  receiver_provider_id?: string
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
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const realtimeChannelRef = useRef<any>(null)
  
  // Mobile state
  const [showConversations, setShowConversations] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  
  // Store provider profile pictures
  const [providerAvatars, setProviderAvatars] = useState<Record<string, string>>({})

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
  }, [selectedConversation])

  // Check auth and load messages
  useEffect(() => {
    checkAuthAndLoadMessages()
    
    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current)
      }
    }
  }, [])

  // Load provider pictures
  const loadProviderAvatars = async (providerIds: string[]) => {
    if (providerIds.length === 0) return
    
    try {
      const { data: providers, error } = await supabase
        .from('providers')
        .select('id, profile_picture_url, business_name, user_id')
        .in('id', providerIds)

      if (!error && providers) {
        const avatars: Record<string, string> = {}
        providers.forEach(provider => {
          if (provider.profile_picture_url) {
            avatars[provider.id] = provider.profile_picture_url
            if (provider.user_id) {
              avatars[provider.user_id] = provider.profile_picture_url
            }
          } else if (provider.business_name) {
            const generatedUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.business_name)}&background=008751&color=fff&size=256&bold=true`
            avatars[provider.id] = generatedUrl
            if (provider.user_id) {
              avatars[provider.user_id] = generatedUrl
            }
          }
        })
        setProviderAvatars(prev => ({ ...prev, ...avatars }))
      }
    } catch (error) {
      console.error('Error loading provider avatars:', error)
    }
  }

  // Get user avatar URL
  const getUserAvatar = (conversation: Conversation): string => {
    // Check if user is a provider and we have their avatar
    if (conversation.userId && providerAvatars[conversation.userId]) {
      return providerAvatars[conversation.userId]
    }
    
    // Check if user is a provider and we have their providerId avatar
    if (conversation.providerId && providerAvatars[conversation.providerId]) {
      return providerAvatars[conversation.providerId]
    }
    
    // Use userAvatar from profiles table
    if (conversation.userAvatar) {
      return conversation.userAvatar
    }
    
    // Generate avatar from name
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.userDisplayName)}&background=${
      conversation.userType === 'provider' ? '008751' : '3b82f6'
    }&color=fff&size=256&bold=true`
  }

  // Get sender avatar for chat messages
  const getSenderAvatar = (message: Message): string => {
    const isSender = message.sender_id === user?.id
    const otherUserId = isSender ? message.receiver_id : message.sender_id
    
    // Find conversation for this user
    const conversation = conversations.find(c => c.userId === otherUserId)
    
    if (conversation) {
      return getUserAvatar(conversation)
    }
    
    // Check if sender is a provider with profile picture
    if (message.sender_provider_id && providerAvatars[message.sender_provider_id]) {
      return providerAvatars[message.sender_provider_id]
    }
    
    // Check if sender user_id has provider avatar
    if (providerAvatars[message.sender_id]) {
      return providerAvatars[message.sender_id]
    }
    
    // Fallback for unknown users
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      message.sender_display_name || 'User'
    )}&background=6b7280&color=fff&size=256&bold=true`
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [messages])

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
      
      // CHECK FOR SAVED PROVIDER FROM LOCALSTORAGE
      const savedProvider = localStorage.getItem('selectedProvider')
      let targetUserId = null
      
      if (savedProvider) {
        try {
          const provider = JSON.parse(savedProvider)
          targetUserId = provider.userId
        } catch (e) {
          console.error('Error parsing saved provider:', e)
        }
      }
      
      await loadConversations(session.user.id, targetUserId)
      setupRealtimeSubscription(session.user.id)
      
    } catch (error) {
      console.error('Error loading messages:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  // Load conversations with target user priority
  const loadConversations = async (userId: string, targetUserId?: string) => {
    try {
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

      const userIds = new Set<string>()
      
      if (messagesData && messagesData.length > 0) {
        messagesData.forEach(msg => {
          if (msg.sender_id !== userId) userIds.add(msg.sender_id)
          if (msg.receiver_id !== userId) userIds.add(msg.receiver_id)
        })
      }

      // Add targetUserId if it exists and not already in the set
      if (targetUserId && !userIds.has(targetUserId)) {
        userIds.add(targetUserId)
      }

      if (userIds.size > 0) {
        await ensureMultipleProfiles(Array.from(userIds))

        // Get profiles with provider information
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, display_name, email, user_type, provider_id, avatar_url')
          .in('user_id', Array.from(userIds))

        if (profilesError) {
          console.error('Error loading profiles:', profilesError)
          setConversations([])
          return
        }

        const profilesMap = new Map()
        const providerIds: string[] = []
        
        profiles?.forEach(profile => {
          profilesMap.set(profile.user_id, profile)
          if (profile.provider_id) {
            providerIds.push(profile.provider_id)
          }
        })

        // Load provider avatars for those with provider_id
        if (providerIds.length > 0) {
          await loadProviderAvatars(providerIds)
        }

        const conversationsList: Conversation[] = []
        
        for (const otherUserId of Array.from(userIds)) {
          const userMessages = messagesData?.filter(msg => 
            msg.sender_id === otherUserId || msg.receiver_id === otherUserId
          ) || []
          
          const lastMessage = userMessages.length > 0 ? userMessages[0] : {
            content: 'Start a conversation',
            created_at: new Date().toISOString()
          }
          
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

        // PRIORITIZE TARGET USER IF PROVIDED
        if (targetUserId && sortedConversations.some(c => c.userId === targetUserId)) {
          setSelectedConversation(targetUserId)
          await loadMessagesWithUser(userId, targetUserId)
          localStorage.removeItem('selectedProvider')
          // On mobile, switch to chat view
          setShowConversations(false)
        } else if (sortedConversations.length > 0 && !selectedConversation) {
          // Fallback to first conversation
          setSelectedConversation(sortedConversations[0].userId)
          await loadMessagesWithUser(userId, sortedConversations[0].userId)
          // On mobile, start in chat view if there's a conversation
          setShowConversations(false)
        } else {
          // No conversations, stay in conversation list view on mobile
          setShowConversations(true)
        }
      } else {
        setConversations([])
        // No conversations, stay in conversation list view on mobile
        setShowConversations(true)
      }

    } catch (error) {
      console.error('Error loading conversations:', error)
      setConversations([])
    }
  }

  // Load messages with user
  const loadMessagesWithUser = async (currentUserId: string, otherUserId: string) => {
    try {
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
        setMessages([])
        return
      }

      const filteredMessages = messagesData.filter(msg =>
        (msg.sender_id === currentUserId && msg.receiver_id === otherUserId) ||
        (msg.sender_id === otherUserId && msg.receiver_id === currentUserId)
      )

      // Get profiles for both users including provider information
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, user_type, provider_id, avatar_url')
        .in('user_id', [currentUserId, otherUserId])

      if (profilesError) {
        console.error('Error loading profiles:', profilesError)
        setMessages([])
        return
      }

      const profilesMap = new Map()
      const providerIds: string[] = []
      
      profiles?.forEach(profile => {
        profilesMap.set(profile.user_id, {
          display_name: profile.display_name,
          user_type: profile.user_type,
          provider_id: profile.provider_id,
          avatar_url: profile.avatar_url
        })
        
        if (profile.provider_id) {
          providerIds.push(profile.provider_id)
        }
      })

      // Load provider avatars for this conversation
      if (providerIds.length > 0) {
        await loadProviderAvatars(providerIds)
      }

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
          receiver_user_type: receiverProfile?.user_type || 'customer',
          sender_provider_id: senderProfile?.provider_id,
          receiver_provider_id: receiverProfile?.provider_id
        }
      })

      setMessages(formattedMessages)

      // Mark messages as read
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

      // Update conversation unread count
      setConversations(prev =>
        prev.map(conv =>
          conv.userId === otherUserId ? { ...conv, unreadCount: 0 } : conv
        )
      )

    } catch (error) {
      console.error('Error loading messages:', error)
      setMessages([])
    }
  }

  // SEND MESSAGE
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

      // SIMPLE INSERT
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedConversation,
          content: newMessage.trim(),
          is_read: false
        })

      if (error) {
        console.error('❌ Send failed:', error)
        
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

  // Fixed loading component
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-700 font-medium">Loading messages...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - FIXED: Simplified mobile header */}
      <div className="lg:hidden bg-white border-b shadow-sm fixed top-0 left-0 right-0 z-50">
        {showConversations ? (
          // Conversations List Header
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push('/')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Home className="h-5 w-5 text-gray-700" />
                </button>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Messages</h1>
                  <p className="text-xs text-gray-500">
                    {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
                <button
                  onClick={handleRefresh}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                >
                  <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* Mobile Search Bar - Toggleable */}
            {showSearch && (
              <div className="mt-3 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          // Chat Header (when in conversation)
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowConversations(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                {selectedUser && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      <img
                        src={getUserAvatar(selectedUser)}
                        alt={selectedUser.userDisplayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            const fallback = document.createElement('div')
                            fallback.className = `w-full h-full flex items-center justify-center text-white font-bold ${
                              selectedUser.userType === 'provider'
                                ? 'bg-gradient-to-br from-green-500 to-green-600'
                                : 'bg-gradient-to-br from-blue-500 to-blue-600'
                            }`
                            fallback.textContent = selectedUser.userDisplayName.charAt(0).toUpperCase()
                            parent.appendChild(fallback)
                          }
                        }}
                      />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 text-sm">
                        {selectedUser.userDisplayName}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {realtimeConnected ? 'Online' : 'Recently active'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b">
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
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - FIXED: Simplified mobile layout */}
      <div className="max-w-7xl mx-auto">
        {/* Mobile: Show conversations or chat based on state */}
        <div className="lg:hidden">
          {/* Conversations List - Mobile */}
          {showConversations ? (
            <div className="bg-white min-h-screen pt-16"> {/* FIXED: Added pt-16 to push below header */}
              <div className="p-4">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center mt-8">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No conversations yet</p>
                    <button
                      onClick={() => router.push('/marketplace')}
                      className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Find Service Providers
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => {
                      const avatarUrl = getUserAvatar(conversation)
                      
                      return (
                        <div
                          key={conversation.userId}
                          onClick={() => {
                            setSelectedConversation(conversation.userId)
                            if (user) {
                              loadMessagesWithUser(user.id, conversation.userId)
                            }
                            setShowConversations(false)
                          }}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedConversation === conversation.userId
                              ? 'bg-primary/10'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                <img
                                  src={avatarUrl}
                                  alt={conversation.userDisplayName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                    const parent = target.parentElement
                                    if (parent) {
                                      const fallback = document.createElement('div')
                                      fallback.className = `w-full h-full flex items-center justify-center text-white font-semibold ${
                                        conversation.userType === 'provider'
                                          ? 'bg-gradient-to-br from-green-500 to-green-600'
                                          : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                      }`
                                      fallback.textContent = conversation.userDisplayName.charAt(0).toUpperCase()
                                      parent.appendChild(fallback)
                                    }
                                  }}
                                />
                              </div>
                              {conversation.unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
                                  {conversation.unreadCount}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-gray-900 truncate text-sm">
                                    {conversation.userDisplayName}
                                  </h3>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {conversation.userType === 'provider' ? 'Service Provider' : 'Customer'}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {formatDate(conversation.lastMessageTime)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 truncate mt-1">
                                {conversation.lastMessage}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Chat View - Mobile
            <div className="bg-white min-h-screen flex flex-col">
              {/* Chat Header is already shown as fixed header */}
              
              {/* Messages Container */}
              <div 
                className="flex-1 overflow-y-auto p-4 mt-16 mb-20" // FIXED: mt-16 for header, mb-20 for input
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No messages yet. Start a conversation!</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Send a message to {selectedUser?.userDisplayName}
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.sender_id === user?.id
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isOwnMessage && (
                            <div className="mr-2 self-end">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                <img
                                  src={getSenderAvatar(message)}
                                  alt={message.sender_display_name || 'User'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                    const parent = target.parentElement
                                    if (parent) {
                                      const fallback = document.createElement('div')
                                      fallback.className = `w-full h-full flex items-center justify-center text-white font-semibold ${
                                        selectedUser?.userType === 'provider'
                                          ? 'bg-gradient-to-br from-green-500 to-green-600'
                                          : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                      }`
                                      fallback.textContent = (message.sender_display_name || 'U').charAt(0).toUpperCase()
                                      parent.appendChild(fallback)
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                              isOwnMessage
                                ? 'bg-primary text-white rounded-br-none'
                                : 'bg-gray-100 text-gray-900 rounded-bl-none'
                            }`}
                          >
                            {!isOwnMessage && (
                              <div className="mb-1">
                                <span className="text-xs font-medium text-gray-700">
                                  {message.sender_display_name || 'User'}
                                </span>
                              </div>
                            )}
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center justify-end mt-1 ${isOwnMessage ? 'text-white/80' : 'text-gray-500'}`}>
                              <span className="text-xs mr-2">
                                {formatTime(message.created_at)}
                              </span>
                              {isOwnMessage && (
                                <span>
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
              </div>

              {/* Message Input - Fixed at bottom */}
              <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-white z-40">
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
                    className={`p-3 rounded-full font-medium ${
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
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-row h-[calc(100vh-180px)] bg-white rounded-xl shadow-sm border overflow-hidden">
            
            {/* Conversations List - Desktop */}
            <div className="w-1/3 border-r overflow-hidden flex flex-col">
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
                    <button
                      onClick={() => router.push('/marketplace')}
                      className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Find Service Providers
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredConversations.map((conversation) => {
                      const avatarUrl = getUserAvatar(conversation)
                      
                      return (
                        <div
                          key={conversation.userId}
                          onClick={() => {
                            setSelectedConversation(conversation.userId)
                            if (user) {
                              loadMessagesWithUser(user.id, conversation.userId)
                            }
                          }}
                          className={`p-4 cursor-pointer transition-colors ${
                            selectedConversation === conversation.userId
                              ? 'bg-primary/5'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                <img
                                  src={avatarUrl}
                                  alt={conversation.userDisplayName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                    const parent = target.parentElement
                                    if (parent) {
                                      const fallback = document.createElement('div')
                                      fallback.className = `w-full h-full flex items-center justify-center text-white font-semibold ${
                                        conversation.userType === 'provider'
                                          ? 'bg-gradient-to-br from-green-500 to-green-600'
                                          : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                      }`
                                      fallback.textContent = conversation.userDisplayName.charAt(0).toUpperCase()
                                      parent.appendChild(fallback)
                                    }
                                  }}
                                />
                              </div>
                              {conversation.unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
                                  {conversation.unreadCount}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-gray-900 truncate">
                                    {conversation.userDisplayName}
                                  </h3>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {conversation.userType === 'provider' ? 'Service Provider' : 'Customer'}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {formatDate(conversation.lastMessageTime)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 truncate mt-1">
                                {conversation.lastMessage}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area - Desktop */}
            <div className="w-2/3 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Messages Container */}
                  <div 
                    className="flex-1 overflow-y-auto p-4"
                  >
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-12">
                          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No messages yet. Start a conversation!</p>
                          <p className="text-sm text-gray-400 mt-2">
                            Send a message to {selectedUser?.userDisplayName}
                          </p>
                        </div>
                      ) : (
                        messages.map((message) => {
                          const isOwnMessage = message.sender_id === user?.id
                          
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              {!isOwnMessage && (
                                <div className="mr-2 self-end">
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                    <img
                                      src={getSenderAvatar(message)}
                                      alt={message.sender_display_name || 'User'}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.style.display = 'none'
                                        const parent = target.parentElement
                                        if (parent) {
                                          const fallback = document.createElement('div')
                                          fallback.className = `w-full h-full flex items-center justify-center text-white font-semibold ${
                                            selectedUser?.userType === 'provider'
                                              ? 'bg-gradient-to-br from-green-500 to-green-600'
                                              : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                          }`
                                          fallback.textContent = (message.sender_display_name || 'U').charAt(0).toUpperCase()
                                          parent.appendChild(fallback)
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              <div
                                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                  isOwnMessage
                                    ? 'bg-primary text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                }`}
                              >
                                {!isOwnMessage && (
                                  <div className="mb-1">
                                    <span className="text-xs font-medium text-gray-700">
                                      {message.sender_display_name || 'User'}
                                    </span>
                                  </div>
                                )}
                                <p className="text-sm">{message.content}</p>
                                <div className={`flex items-center justify-end mt-1 ${isOwnMessage ? 'text-white/80' : 'text-gray-500'}`}>
                                  <span className="text-xs mr-2">
                                    {formatTime(message.created_at)}
                                  </span>
                                  {isOwnMessage && (
                                    <span>
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
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t bg-white">
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
                        className={`p-3 rounded-full font-medium ${
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
                // Empty State - Desktop
                <div className="flex flex-1 items-center justify-center">
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
    </div>
  )
}