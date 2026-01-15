// components/Navbar.tsx - FIXED VERSION
'use client'

import { useState, useEffect, useRef, useCallback, memo, ComponentType, ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ensureUserProfile } from '@/lib/profile-sync'
import { 
  MessageSquare, Bell, User, 
  LayoutDashboard, Calendar, Settings,
  LogOut, ChevronDown, X,
  Briefcase, Home, Search,
  ShoppingBag, Heart, HelpCircle,
  CreditCard, Shield
} from 'lucide-react'

// Memoized icon components for better performance
const NavIcon = memo(function NavIcon({ 
  icon: Icon, 
  className = "h-5 w-5" 
}: { 
  icon: ComponentType<any>, 
  className?: string 
}) {
  return <Icon className={className} />
})

// Optimized badge component
const NotificationBadge = memo(function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 border-2 border-white shadow-lg animate-pulse">
      {count > 9 ? '9+' : count}
    </span>
  )
})

// User avatar component with image optimization
const UserAvatar = memo(function UserAvatar({ 
  profilePicture, 
  displayName,
  size = "md"
}: { 
  profilePicture?: string | null
  displayName: string
  size?: "sm" | "md" | "lg"
}) {
  const initials = displayName.charAt(0).toUpperCase()
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg"
  }
  
  return (
    <div className={`relative rounded-full overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors duration-200 ${sizeClasses[size]}`}>
      {profilePicture ? (
        <img
          src={profilePicture}
          alt={displayName}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white font-semibold">
          {initials}
        </div>
      )}
    </div>
  )
})

// Mobile menu 9-dot grid icon
const NineDotMenuIcon = memo(function NineDotMenuIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="relative w-6 h-6">
      <div className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
        <div className="grid grid-cols-3 gap-1 w-full h-full">
          {Array.from({ length: 9 }).map((_, i) => (
            <div 
              key={i}
              className="w-full h-full bg-gray-600 rounded-sm"
            />
          ))}
        </div>
      </div>
      <div className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        <X className="w-full h-full text-gray-600" />
      </div>
    </div>
  )
})

// Helper Components with proper TypeScript
interface NavLinkProps {
  href: string
  icon: ComponentType<any>
  children: ReactNode
  onClick: () => void
  badge?: number
  className?: string
}

const NavLink = memo(function NavLink({ 
  href, 
  icon: Icon, 
  children, 
  onClick, 
  badge,
  className = ""
}: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 px-4 py-3 text-sm transition-colors text-gray-700 hover:text-primary hover:bg-gray-50/80 ${className}`}
      onClick={onClick}
      prefetch
    >
      <Icon className="h-4 w-4 text-gray-500" />
      <span className="flex-1">{children}</span>
      {badge !== undefined && badge > 0 && (
        <span className="w-6 h-6 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  )
})

interface MobileNavLinkProps {
  href: string
  icon?: ComponentType<any>
  children: ReactNode
  onClick: () => void
  active?: boolean
  badge?: number
  className?: string
}

const MobileNavLink = memo(function MobileNavLink({ 
  href, 
  icon: Icon, 
  children, 
  onClick, 
  active = false,
  badge,
  className = ""
}: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${active
        ? 'bg-primary text-white font-medium shadow-sm'
        : `text-gray-700 hover:text-primary hover:bg-gray-50/80 ${className}`
      }`}
      onClick={onClick}
      prefetch
    >
      {Icon && <Icon className={`h-5 w-5 mr-3 ${active ? 'text-white' : 'text-gray-500'}`} />}
      <span className="flex-1">{children}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`w-6 h-6 ${active ? 'bg-white text-red-600' : 'bg-red-600 text-white'} text-xs rounded-full flex items-center justify-center font-bold`}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  )
})

export default function ModernNavbar() {
  const [user, setUser] = useState<any>(null)
  const [userType, setUserType] = useState<'customer' | 'provider' | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [userProfile, setUserProfile] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()
  const userMenuRef = useRef<HTMLDivElement>(null)
  
  // Refs for subscriptions
  const subscriptionRef = useRef<any>(null)
  const mountedRef = useRef(true)

  // Optimized auth check with caching
  const checkAuth = useCallback(async () => {
    if (!mountedRef.current) return
    
    try {
      // Check for cached session first
      const cachedSession = localStorage.getItem('nimart-cached-session')
      if (cachedSession) {
        const { user: cachedUser, expiresAt } = JSON.parse(cachedSession)
        if (Date.now() < expiresAt) {
          setUser(cachedUser)
          setUserType(cachedUser?.user_metadata?.user_type || null)
          
          if (cachedUser?.id) {
            await loadUserProfile(cachedUser.id)
            await loadUnreadCounts(cachedUser.id)
            setupRealtimeSubscription(cachedUser.id)
          }
          setLoading(false)
          return
        }
      }
      
      // If no cache or expired, fetch fresh session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (mountedRef.current) {
        setUser(session?.user || null)
        setUserType(session?.user?.user_metadata?.user_type || null)
        
        if (session?.user) {
          // Cache the session
          const cacheData = {
            user: session.user,
            expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes cache
          }
          localStorage.setItem('nimart-cached-session', JSON.stringify(cacheData))
          
          await Promise.all([
            loadUserProfile(session.user.id),
            loadUnreadCounts(session.user.id)
          ])
          setupRealtimeSubscription(session.user.id)
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      if (mountedRef.current) {
        setUser(null)
        setUserType(null)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  // Load user profile with optimization
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      await ensureUserProfile(userId)
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      setUserProfile(profile)
      
      // Cache profile data
      if (profile) {
        localStorage.setItem(`nimart-profile-${userId}`, JSON.stringify({
          ...profile,
          cachedAt: Date.now()
        }))
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      // Try to load from cache
      const cachedProfile = localStorage.getItem(`nimart-profile-${userId}`)
      if (cachedProfile) {
        const { cachedAt, ...profileData } = JSON.parse(cachedProfile)
        if (Date.now() - cachedAt < 10 * 60 * 1000) { // 10 minutes cache
          setUserProfile(profileData)
        }
      }
    }
  }, [])

  // Load unread counts with optimization
  const loadUnreadCounts = useCallback(async (userId: string) => {
    try {
      // Use Promise.all for parallel loading
      const [notificationsResult, messagesResult] = await Promise.allSettled([
        supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('is_read', false),
        supabase
          .from('messages')
          .select('id')
          .eq('receiver_id', userId)
          .eq('is_read', false)
      ])

      if (notificationsResult.status === 'fulfilled') {
        setUnreadCount(notificationsResult.value.data?.length || 0)
      }

      if (messagesResult.status === 'fulfilled') {
        setUnreadMessages(messagesResult.value.data?.length || 0)
      }
    } catch (error) {
      console.error('Error loading unread counts:', error)
    }
  }, [])

  // Setup Realtime subscription with cleanup
  const setupRealtimeSubscription = useCallback((userId: string) => {
    // Cleanup existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
      subscriptionRef.current = null
    }

    try {
      const subscription = supabase
        .channel(`navbar-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${userId}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setUnreadMessages(prev => prev + 1)
            } else if (payload.eventType === 'UPDATE') {
              const newMessage = payload.new as any
              if (newMessage.is_read === true) {
                setUnreadMessages(prev => Math.max(0, prev - 1))
              }
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setUnreadCount(prev => prev + 1)
            } else if (payload.eventType === 'UPDATE') {
              const notification = payload.new as any
              if (notification.is_read === true) {
                setUnreadCount(prev => Math.max(0, prev - 1))
              }
            }
          }
        )
        .subscribe()

      subscriptionRef.current = subscription
      
    } catch (error) {
      console.error('Error setting up Realtime subscription:', error)
    }
  }, [])

  // Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    try {
      if (!user) return
      
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      setUnreadMessages(0)
      
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }, [user])

  // Mark notifications as read
  const markNotificationsAsRead = useCallback(async () => {
    try {
      if (!user) return
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      setUnreadCount(0)
      
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }, [user])

  // Handle logout with cleanup
  const handleLogout = useCallback(async () => {
    try {
      setUserMenuOpen(false)
      setMobileMenuOpen(false)
      
      // Cleanup
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
      
      mountedRef.current = false
      
      // Clear cache
      localStorage.removeItem('nimart-cached-session')
      if (user?.id) {
        localStorage.removeItem(`nimart-profile-${user.id}`)
      }
      
      await supabase.auth.signOut()
      router.push('/login')
      
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }, [router, user?.id])

  // Get user info
  const getUserDisplayName = useCallback(() => {
    if (!user) return 'Guest'
    if (userProfile?.display_name) return userProfile.display_name
    if (user.user_metadata?.business_name) return user.user_metadata.business_name
    if (user.user_metadata?.name) return user.user_metadata.name
    return user.email?.split('@')[0] || 'User'
  }, [user, userProfile])

  const getUserProfilePicture = useCallback(() => {
    if (userProfile?.avatar_url) return userProfile.avatar_url
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url
    if (user?.user_metadata?.profile_picture_url) return user.user_metadata.profile_picture_url
    return null
  }, [user, userProfile])

  // Initialize with optimized loading
  useEffect(() => {
    mountedRef.current = true
    
    const init = async () => {
      await checkAuth()
      
      // Setup auth listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mountedRef.current) return
          
          setUser(session?.user || null)
          setUserType(session?.user?.user_metadata?.user_type || null)
          
          if (session?.user) {
            // Update cache
            const cacheData = {
              user: session.user,
              expiresAt: Date.now() + (5 * 60 * 1000)
            }
            localStorage.setItem('nimart-cached-session', JSON.stringify(cacheData))
            
            await loadUserProfile(session.user.id)
            await loadUnreadCounts(session.user.id)
            setupRealtimeSubscription(session.user.id)
          } else {
            setUnreadCount(0)
            setUnreadMessages(0)
            setUserProfile(null)
            
            if (subscriptionRef.current) {
              subscriptionRef.current.unsubscribe()
              subscriptionRef.current = null
            }
          }
        }
      )

      return () => subscription.unsubscribe()
    }

    init()

    return () => {
      mountedRef.current = false
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [checkAuth, loadUserProfile, loadUnreadCounts, setupRealtimeSubscription])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false)
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  // Loading skeleton
  if (loading) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/95 border-b border-gray-200/50 h-16 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex items-center justify-between h-full">
              {/* Logo skeleton */}
              <div className="h-8 w-28 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg"></div>
              
              {/* Desktop actions skeleton */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-lg"></div>
              </div>
              
              {/* Mobile menu button skeleton */}
              <div className="lg:hidden">
                <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-16"></div>
      </>
    )
  }

  return (
    <>
      {/* Fixed Navigation Container - MODERN DESIGN */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/95 border-b border-gray-200/30 h-16 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo - Optimized for no flicker */}
            <Link 
              href="/" 
              className="flex items-center transition-transform duration-200 hover:scale-105 active:scale-95"
              prefetch
            >
              <div className="relative h-8 w-28">
                <div className="absolute inset-0">
                  <Image
                    src="/logo.png"
                    alt="Nimart Logo"
                    fill
                    className="object-contain"
                    priority
                    sizes="112px"
                    quality={90}
                  />
                </div>
              </div>
            </Link>

            {/* Desktop Actions - Optimized */}
            <div className="hidden lg:flex items-center space-x-2">
              {user ? (
                <>
                  {/* Messages Icon */}
                  <div className="relative">
                    <Link
                      href="/messages"
                      className="p-2 rounded-xl transition-all duration-200 relative inline-flex items-center justify-center text-gray-700 hover:text-primary hover:bg-gray-100/80 active:scale-95"
                      title="Messages"
                      onClick={markMessagesAsRead}
                      prefetch
                    >
                      <MessageSquare className="h-5 w-5" />
                      <NotificationBadge count={unreadMessages} />
                    </Link>
                  </div>

                  {/* Notifications Icon */}
                  <div className="relative">
                    <Link
                      href="/notifications"
                      className="p-2 rounded-xl transition-all duration-200 relative inline-flex items-center justify-center text-gray-700 hover:text-primary hover:bg-gray-100/80 active:scale-95"
                      title="Notifications"
                      onClick={markNotificationsAsRead}
                      prefetch
                    >
                      <Bell className="h-5 w-5" />
                      <NotificationBadge count={unreadCount} />
                    </Link>
                  </div>

                  {/* User Avatar with Dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 p-1 rounded-xl transition-all duration-200 group hover:bg-gray-100/80 active:scale-95"
                      aria-label="User menu"
                    >
                      <UserAvatar 
                        profilePicture={getUserProfilePicture()}
                        displayName={getUserDisplayName()}
                        size="md"
                      />
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                        userMenuOpen ? 'rotate-180' : ''
                      } text-gray-500`} />
                    </button>

                    {/* User Dropdown Menu - Modern Design */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50 bg-white/95 backdrop-blur-xl border-gray-200/30">
                        {/* User Info Header */}
                        <div className="p-4 border-b border-gray-200/30 bg-gradient-to-r from-gray-50/50 to-white/50">
                          <div className="flex items-center space-x-3">
                            <UserAvatar 
                              profilePicture={getUserProfilePicture()}
                              displayName={getUserDisplayName()}
                              size="lg"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate text-gray-900">
                                {getUserDisplayName()}
                              </p>
                              <p className="text-xs truncate text-gray-500">
                                {user.email}
                              </p>
                              <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${userType === 'provider' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                              }`}>
                                {userType === 'provider' ? 'Verified Provider' : 'Customer'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="py-2">
                          {userType === 'provider' ? (
                            <>
                              <NavLink href="/provider/dashboard" icon={LayoutDashboard} onClick={() => setUserMenuOpen(false)}>
                                Dashboard
                              </NavLink>
                              <NavLink href="/provider/bookings" icon={Calendar} onClick={() => setUserMenuOpen(false)}>
                                Bookings
                              </NavLink>
                              <NavLink href="/provider/settings" icon={Settings} onClick={() => setUserMenuOpen(false)}>
                                Settings
                              </NavLink>
                            </>
                          ) : (
                            <>
                              <NavLink href="/bookings" icon={ShoppingBag} onClick={() => setUserMenuOpen(false)}>
                                My Bookings
                              </NavLink>
                              <NavLink href="/profile" icon={User} onClick={() => setUserMenuOpen(false)}>
                                Profile
                              </NavLink>
                              <NavLink href="/favorites" icon={Heart} onClick={() => setUserMenuOpen(false)}>
                                Favorites
                              </NavLink>
                              <NavLink href="/payments" icon={CreditCard} onClick={() => setUserMenuOpen(false)}>
                                Payments
                              </NavLink>
                            </>
                          )}
                          
                          <div className="border-t border-gray-200/30 my-2"></div>
                          
                          <NavLink href="/messages" icon={MessageSquare} onClick={() => { setUserMenuOpen(false); markMessagesAsRead(); }} badge={unreadMessages}>
                            Messages
                          </NavLink>
                          
                          <NavLink href="/notifications" icon={Bell} onClick={() => { setUserMenuOpen(false); markNotificationsAsRead(); }} badge={unreadCount}>
                            Notifications
                          </NavLink>
                          
                          <NavLink href="/help" icon={HelpCircle} onClick={() => setUserMenuOpen(false)}>
                            Help Center
                          </NavLink>
                          
                          {/* For Providers link for non-providers */}
                          {userType !== 'provider' && !loading && (
                            <>
                              <div className="border-t border-gray-200/30 my-2"></div>
                              <NavLink href="/provider/register" icon={Briefcase} onClick={() => setUserMenuOpen(false)} className="text-primary hover:text-green-700 hover:bg-green-50">
                                Become a Provider
                              </NavLink>
                            </>
                          )}
                        </div>
                        
                        {/* Logout */}
                        <div className="border-t border-gray-200/30">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-sm transition-colors text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:border-primary hover:text-primary hover:bg-primary/5 active:scale-95"
                    prefetch
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-gradient-to-r from-primary to-green-600 text-white rounded-xl hover:from-green-600 hover:to-primary font-medium shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                    prefetch
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button - 9-dot grid */}
            <div className="lg:hidden flex items-center space-x-3">
              {/* Messages Icon (Mobile) */}
              {user && (
                <div className="relative">
                  <Link
                    href="/messages"
                    className="p-2 rounded-xl transition-all duration-200 relative inline-flex items-center justify-center text-gray-700 hover:text-primary hover:bg-gray-100/80 active:scale-95"
                    title="Messages"
                    onClick={markMessagesAsRead}
                    prefetch
                  >
                    <MessageSquare className="h-5 w-5" />
                    <NotificationBadge count={unreadMessages} />
                  </Link>
                </div>
              )}
              
              {/* Notifications Icon (Mobile) */}
              {user && (
                <div className="relative">
                  <Link
                    href="/notifications"
                    className="p-2 rounded-xl transition-all duration-200 relative inline-flex items-center justify-center text-gray-700 hover:text-primary hover:bg-gray-100/80 active:scale-95"
                    title="Notifications"
                    onClick={markNotificationsAsRead}
                    prefetch
                  >
                    <Bell className="h-5 w-5" />
                    <NotificationBadge count={unreadCount} />
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button - 9-dot grid */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl transition-all duration-200 text-gray-700 hover:text-primary hover:bg-gray-100/80 active:scale-95"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                <NineDotMenuIcon isOpen={mobileMenuOpen} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Modern Design */}
      <div 
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ease-out ${
          mobileMenuOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
        style={{ marginTop: '64px' }}
      >
        <div 
          className={`absolute inset-0 transition-opacity duration-300 ease-out ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          } bg-black/40 backdrop-blur-sm`}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        <div 
          className={`absolute top-0 right-0 bottom-0 w-80 sm:w-96 shadow-2xl transition-all duration-300 ease-out ${
            mobileMenuOpen 
              ? 'translate-x-0 opacity-100' 
              : 'translate-x-full opacity-0'
          } bg-white/95 backdrop-blur-xl border-l border-gray-200/30`}
        >
          {/* User Info Header */}
          <div className="p-6 border-b border-gray-200/30 bg-gradient-to-r from-gray-50/50 to-white/50">
            <div className="flex items-center">
              <UserAvatar 
                profilePicture={getUserProfilePicture()}
                displayName={getUserDisplayName()}
                size="lg"
              />
              <div className="flex-1 min-w-0 ml-4">
                <p className="font-semibold truncate text-gray-900">
                  {getUserDisplayName()}
                </p>
                {user && (
                  <>
                    <p className="text-sm truncate text-gray-500">
                      {user.email}
                    </p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${userType === 'provider' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                    }`}>
                      {userType === 'provider' ? 'Verified Provider' : 'Customer'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="overflow-y-auto h-[calc(100%-140px)]">
            <div className="p-4 space-y-1">
              {user ? (
                <>
                  <MobileNavLink href="/" icon={Home} onClick={() => setMobileMenuOpen(false)}>
                    Home
                  </MobileNavLink>
                  
                  <MobileNavLink href="/marketplace" icon={Search} onClick={() => setMobileMenuOpen(false)}>
                    Search Services
                  </MobileNavLink>
                  
                  {userType === 'provider' ? (
                    <>
                      <MobileNavLink href="/provider/dashboard" icon={LayoutDashboard} active={pathname === '/provider/dashboard'} onClick={() => setMobileMenuOpen(false)}>
                        Dashboard
                      </MobileNavLink>
                      <MobileNavLink href="/provider/bookings" icon={Calendar} active={pathname === '/provider/bookings'} onClick={() => setMobileMenuOpen(false)}>
                        Bookings
                      </MobileNavLink>
                      <MobileNavLink href="/provider/settings" icon={Settings} active={pathname === '/provider/settings'} onClick={() => setMobileMenuOpen(false)}>
                        Settings
                      </MobileNavLink>
                    </>
                  ) : (
                    <>
                      <MobileNavLink href="/bookings" icon={ShoppingBag} active={pathname === '/bookings'} onClick={() => setMobileMenuOpen(false)}>
                        My Bookings
                      </MobileNavLink>
                      <MobileNavLink href="/profile" icon={User} active={pathname === '/profile'} onClick={() => setMobileMenuOpen(false)}>
                        Profile
                      </MobileNavLink>
                      <MobileNavLink href="/favorites" icon={Heart} active={pathname === '/favorites'} onClick={() => setMobileMenuOpen(false)}>
                        Favorites
                      </MobileNavLink>
                    </>
                  )}
                  
                  <MobileNavLink href="/messages" icon={MessageSquare} active={pathname === '/messages'} onClick={() => { setMobileMenuOpen(false); markMessagesAsRead(); }} badge={unreadMessages}>
                    Messages
                  </MobileNavLink>
                  
                  <MobileNavLink href="/notifications" icon={Bell} active={pathname === '/notifications'} onClick={() => { setMobileMenuOpen(false); markNotificationsAsRead(); }} badge={unreadCount}>
                    Notifications
                  </MobileNavLink>
                  
                  <MobileNavLink href="/help" icon={HelpCircle} onClick={() => setMobileMenuOpen(false)}>
                    Help Center
                  </MobileNavLink>

                  {/* For Providers link */}
                  {userType !== 'provider' && !loading && (
                    <>
                      <div className="my-4 border-t border-gray-200/30"></div>
                      <MobileNavLink href="/provider/register" icon={Briefcase} onClick={() => setMobileMenuOpen(false)} className="text-primary hover:text-green-700 hover:bg-green-50">
                        Become a Provider
                      </MobileNavLink>
                    </>
                  )}

                  <div className="my-4 border-t border-gray-200/30"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 rounded-xl transition-colors text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink href="/" icon={Home} onClick={() => setMobileMenuOpen(false)}>
                    Home
                  </MobileNavLink>
                  
                  <MobileNavLink href="/marketplace" icon={Search} onClick={() => setMobileMenuOpen(false)}>
                    Search Services
                  </MobileNavLink>
                  
                  <MobileNavLink href="/about" icon={Shield} onClick={() => setMobileMenuOpen(false)}>
                    About Nimart
                  </MobileNavLink>
                  
                  <MobileNavLink href="/how-it-works" icon={HelpCircle} onClick={() => setMobileMenuOpen(false)}>
                    How It Works
                  </MobileNavLink>
                  
                  <div className="my-4 border-t border-gray-200/30"></div>
                  
                  <MobileNavLink href="/login" icon={User} onClick={() => setMobileMenuOpen(false)} className="text-primary hover:text-green-700 hover:bg-green-50">
                    Sign In
                  </MobileNavLink>
                  
                  <MobileNavLink href="/register" className="bg-gradient-to-r from-primary to-green-600 text-white font-medium hover:from-green-600 hover:to-primary" onClick={() => setMobileMenuOpen(false)}>
                    Create Account
                  </MobileNavLink>
                  
                  <MobileNavLink href="/provider/register" icon={Briefcase} onClick={() => setMobileMenuOpen(false)} className="text-primary hover:text-green-700 hover:bg-green-50">
                    Become a Provider
                  </MobileNavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Spacer */}
      <div className="h-16"></div>
    </>
  )
}