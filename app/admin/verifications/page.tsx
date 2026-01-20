// app/admin/verifications/page.tsx - FINAL PRODUCTION VERSION
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Search, Filter, CheckCircle, XCircle, Eye, 
  AlertCircle, Clock, User, Shield, FileText,
  Download, ChevronLeft, ChevronRight, RefreshCw,
  Loader2, Mail, Phone, MapPin, Calendar,
  Lock, Users, FileCheck, AlertTriangle, Ban,
  LogOut, Key, Server, Database
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminVerificationsPage() {
  const [loading, setLoading] = useState(true)
  const [verifications, setVerifications] = useState<any[]>([])
  const [filteredVerifications, setFilteredVerifications] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedVerification, setSelectedVerification] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminInfo, setAdminInfo] = useState<any>(null)
  const [securityCheck, setSecurityCheck] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (adminInfo) {
      loadVerifications()
    }
  }, [adminInfo])

  useEffect(() => {
    filterVerifications()
  }, [searchTerm, filter, verifications])

  const checkAdminAccess = async () => {
    try {
      setSecurityCheck(true)
      console.log('🔐 Starting security check...')
      
      // 1. Check authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        alert('Authentication system error. Please try again.')
        router.push('/login')
        return
      }
      
      if (!session) {
        console.log('❌ No active session found')
        alert('Please login to access the admin panel.')
        router.push('/login')
        return
      }
      
      const userEmail = session.user.email
      const userId = session.user.id
      console.log('👤 User attempting access:', userEmail)
      
      // 2. CHECK DATABASE: Is user in admin_users table?
      console.log('📋 Checking admin_users table...')
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', userEmail)
        .eq('is_active', true)
        .single()
      
      // 3. STRICT ACCESS CONTROL - NO HARDCODED FALLBACK
      if (adminError || !adminData) {
        console.error('❌ ADMIN ACCESS DENIED:', {
          email: userEmail,
          error: adminError?.message,
          inAdminTable: !!adminData
        })
        
        // Log security event
        try {
          await supabase
            .from('security_logs')
            .insert({
              event_type: 'unauthorized_admin_access',
              user_email: userEmail,
              user_id: userId,
              ip_address: 'N/A',
              user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
              details: { 
                path: '/admin/verifications',
                reason: 'Not in admin_users table',
                admin_table_check: 'failed'
              },
              severity: 'high',
              created_at: new Date().toISOString()
            })
        } catch (logError) {
          console.error('Failed to log security event:', logError)
        }
        
        alert(`🔒 ACCESS DENIED\n\nYou do not have administrator privileges.\n\nEmail: ${userEmail}\n\nThis incident has been logged.`)
        
        // Sign out and redirect
        await supabase.auth.signOut()
        router.push('/')
        return
      }
      
      // 4. ACCESS GRANTED
      console.log('✅ ADMIN ACCESS GRANTED:', {
        email: userEmail,
        role: adminData.role,
        permissions: adminData.permissions
      })
      
      setAdminInfo(adminData)
      
      // Log successful access
      try {
        await supabase
          .from('security_logs')
          .insert({
            event_type: 'admin_login_success',
            user_email: userEmail,
            user_id: userId,
            ip_address: 'N/A',
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
            details: { 
              path: '/admin/verifications',
              admin_role: adminData.role,
              permissions: adminData.permissions
            },
            severity: 'low',
            created_at: new Date().toISOString()
          })
      } catch (logError) {
        console.error('Failed to log access:', logError)
      }
      
    } catch (error: any) {
      console.error('❌ Security check error:', error)
      alert('Security system error. Please contact system administrator.')
      router.push('/login')
    } finally {
      setSecurityCheck(false)
    }
  }

  const loadVerifications = async () => {
    try {
      setLoading(true)
      console.log('📋 Loading provider verifications...')
      
      const { data: providers, error } = await supabase
        .from('providers')
        .select(`
          *,
          provider_documents (*),
          states (name),
          lgas (name)
        `)
        .in('verification_status', ['pending', 'verified', 'unverified', 'pending_email', 'demo'])
        .order('verification_submitted_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (error) {
        console.error('Database error:', error)
        throw error
      }
      
      console.log(`✅ Loaded ${providers?.length || 0} providers`)
      setVerifications(providers || [])
      
    } catch (error) {
      console.error('Error loading verifications:', error)
      alert('Failed to load provider data. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  const filterVerifications = () => {
    let filtered = [...verifications]
    
    if (searchTerm) {
      filtered = filtered.filter(v =>
        v.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.phone?.includes(searchTerm)
      )
    }
    
    if (filter !== 'all') {
      if (filter === 'unverified') {
        filtered = filtered.filter(v => 
          v.verification_status === 'unverified' || 
          v.verification_status === 'pending_email' ||
          v.verification_status === 'demo'
        )
      } else {
        filtered = filtered.filter(v => v.verification_status === filter)
      }
    }
    
    setFilteredVerifications(filtered)
    setCurrentPage(1)
  }

  const handleApprove = async (providerId: string) => {
    if (!window.confirm('✅ APPROVE PROVIDER VERIFICATION?\n\nThis will grant the "Verified" badge and increase visibility.')) return
    
    setActionLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const adminUserId = user?.id
      const adminEmail = adminInfo?.email || user?.email
      
      console.log(`✅ Approving provider ${providerId} by ${adminEmail}`)
      
      // Update documents
      const { error: docsError } = await supabase
        .from('provider_documents')
        .update({ 
          status: 'approved',
          verified_by: adminUserId,
          verified_at: new Date().toISOString(),
          verified_by_email: adminEmail
        })
        .eq('provider_id', providerId)
        .eq('status', 'pending')
      
      if (docsError) throw docsError
      
      // Update provider
      const provider = verifications.find(v => v.id === providerId)
      const { error: providerError } = await supabase
        .from('providers')
        .update({
          verification_status: 'verified',
          verification_approved_at: new Date().toISOString(),
          is_verified: true,
          verification_approved_by: adminUserId,
          verification_approved_by_email: adminEmail,
          updated_at: new Date().toISOString()
        })
        .eq('id', providerId)
      
      if (providerError) throw providerError
      
      // Notify provider
      if (provider?.user_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: provider.user_id,
            title: '🎉 Account Verified!',
            message: 'Your Nimart account has been verified. You now have the "Verified" badge.',
            type: 'verification',
            data: { 
              verification_status: 'approved',
              approved_by: adminEmail,
              approved_at: new Date().toISOString()
            },
            created_at: new Date().toISOString()
          })
      }
      
      // Audit log
      await supabase
        .from('admin_audit_log')
        .insert({
          admin_email: adminEmail,
          admin_id: adminUserId,
          action: 'approve_verification',
          target_type: 'provider',
          target_id: providerId,
          details: {
            provider_name: provider?.business_name,
            provider_email: provider?.email,
            documents_count: provider?.provider_documents?.length || 0
          },
          created_at: new Date().toISOString()
        })
      
      alert('✅ Provider verification approved!')
      await loadVerifications()
      
    } catch (error) {
      console.error('Approval error:', error)
      alert('❌ Failed to approve. Please try again.')
    } finally {
      setActionLoading(false)
      setSelectedVerification(null)
    }
  }

  const handleReject = async (providerId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }
    
    if (!window.confirm('❌ REJECT VERIFICATION?\n\nProvider will need to upload new documents.')) return
    
    setActionLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const adminUserId = user?.id
      const adminEmail = adminInfo?.email || user?.email
      
      const provider = verifications.find(v => v.id === providerId)
      
      // Reject documents
      const { error: docsError } = await supabase
        .from('provider_documents')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason,
          verified_by: adminUserId,
          verified_at: new Date().toISOString(),
          verified_by_email: adminEmail
        })
        .eq('provider_id', providerId)
        .in('status', ['pending', 'approved'])
      
      if (docsError) throw docsError
      
      // Update provider status
      const { error: providerError } = await supabase
        .from('providers')
        .update({
          verification_status: 'unverified',
          is_verified: false,
          verification_notes: `Rejected: ${rejectionReason}`,
          verification_submitted_at: null,
          verification_rejected_by: adminUserId,
          verification_rejected_by_email: adminEmail,
          verification_rejected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', providerId)
      
      if (providerError) throw providerError
      
      // Notify provider
      if (provider?.user_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: provider.user_id,
            title: 'Verification Rejected',
            message: `Your verification was rejected: ${rejectionReason}. Please upload new documents.`,
            type: 'verification',
            data: { 
              verification_status: 'rejected', 
              rejection_reason: rejectionReason,
              rejected_by: adminEmail
            },
            created_at: new Date().toISOString()
          })
      }
      
      // Audit log
      await supabase
        .from('admin_audit_log')
        .insert({
          admin_email: adminEmail,
          admin_id: adminUserId,
          action: 'reject_verification',
          target_type: 'provider',
          target_id: providerId,
          details: {
            provider_name: provider?.business_name,
            provider_email: provider?.email,
            rejection_reason: rejectionReason,
            documents_count: provider?.provider_documents?.length || 0
          },
          created_at: new Date().toISOString()
        })
      
      alert('❌ Verification rejected. Provider notified.')
      await loadVerifications()
      setRejectionReason('')
      setSelectedVerification(null)
      
    } catch (error) {
      console.error('Rejection error:', error)
      alert('❌ Failed to reject verification.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const paginatedVerifications = filteredVerifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredVerifications.length / itemsPerPage)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'verified': return 'bg-green-100 text-green-800 border border-green-200'
      case 'pending_email': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'demo': return 'bg-gray-100 text-gray-800 border border-gray-200'
      case 'unverified': return 'bg-red-100 text-red-800 border border-red-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'verified': return <CheckCircle className="h-4 w-4" />
      case 'pending_email': return <Mail className="h-4 w-4" />
      case 'demo': return <AlertCircle className="h-4 w-4" />
      case 'unverified': return <AlertTriangle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 border border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border border-red-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  if (securityCheck) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-center bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 max-w-md">
          <div className="relative mb-6">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
            </div>
            <Key className="h-16 w-16 text-white relative z-10 mx-auto animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Security Check</h2>
          <p className="text-gray-300 mb-6">Verifying administrator credentials...</p>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Database className="h-4 w-4 text-blue-400 animate-pulse" />
              <span className="text-sm text-gray-400">Checking admin database...</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Server className="h-4 w-4 text-green-400 animate-pulse" />
              <span className="text-sm text-gray-400">Validating permissions...</span>
            </div>
          </div>
          <div className="mt-8 text-xs text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-3 w-3" />
              <span>Secure Database Validation</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!adminInfo) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Security Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center py-4">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Nimart Admin Portal</h1>
                <p className="text-sm text-gray-300">Database-Secured Verification System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium bg-gray-700/50 px-3 py-1 rounded">
                  {adminInfo.email}
                </div>
                <div className="text-xs text-gray-300 flex items-center mt-1">
                  <User className="h-3 w-3 mr-1" />
                  {adminInfo.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                </div>
              </div>
              
              <div className="h-8 w-px bg-gray-600"></div>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg flex items-center text-sm font-medium transition-all shadow"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { 
              label: 'Total Providers', 
              value: verifications.length, 
              icon: Users, 
              color: 'from-blue-500 to-blue-600',
              bg: 'bg-blue-100'
            },
            { 
              label: 'Pending Review', 
              value: verifications.filter(v => v.verification_status === 'pending').length, 
              icon: Clock, 
              color: 'from-yellow-500 to-yellow-600',
              bg: 'bg-yellow-100'
            },
            { 
              label: 'Verified', 
              value: verifications.filter(v => v.verification_status === 'verified').length, 
              icon: CheckCircle, 
              color: 'from-green-500 to-green-600',
              bg: 'bg-green-100'
            },
            { 
              label: 'Unverified', 
              value: verifications.filter(v => v.verification_status === 'unverified').length, 
              icon: Ban, 
              color: 'from-red-500 to-red-600',
              bg: 'bg-red-100'
            }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg mr-4 ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Panel */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Provider Verifications</h2>
                <p className="text-gray-600 mt-1">Review and manage provider verification documents</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={loadVerifications}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
                
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending Review</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                  <option value="pending_email">Pending Email</option>
                </select>
              </div>
              
              <div className="text-sm text-gray-600 flex items-center justify-end">
                Showing {filteredVerifications.length} of {verifications.length} providers
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Provider Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedVerifications.map((verification) => (
                  <tr 
                    key={verification.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold text-lg mr-3">
                          {verification.business_name?.charAt(0) || 'P'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {verification.business_name || 'No business name'}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {verification.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            {verification.phone || 'No phone'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {verification.provider_documents?.slice(0, 2).map((doc: any) => (
                          <div key={doc.id} className="flex items-center justify-between">
                            <span className="text-sm capitalize truncate">
                              {doc.document_type?.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium min-w-[70px] text-center ${getDocumentStatusColor(doc.status)}`}>
                              {doc.status}
                            </span>
                          </div>
                        ))}
                        {(!verification.provider_documents || verification.provider_documents.length === 0) && (
                          <span className="text-sm text-gray-400 italic">No documents</span>
                        )}
                        {verification.provider_documents && verification.provider_documents.length > 2 && (
                          <div className="text-xs text-blue-600 font-medium">
                            +{verification.provider_documents.length - 2} more
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(verification.verification_status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(verification.verification_status)}`}>
                          {verification.verification_status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {verification.is_verified ? '✓ Verified' : '✗ Not verified'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {verification.verification_submitted_at ? (
                          new Date(verification.verification_submitted_at).toLocaleDateString()
                        ) : (
                          <span className="text-gray-400">Not submitted</span>
                        )}
                      </div>
                      {verification.verification_approved_at && (
                        <div className="text-xs text-green-600 mt-1">
                          Approved: {new Date(verification.verification_approved_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedVerification(verification)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 text-sm font-medium flex items-center transition-colors"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Review
                        </button>
                        
                        {verification.verification_status === 'pending' && verification.provider_documents?.length > 0 && (
                          <>
                            <button
                              onClick={() => handleApprove(verification.id)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 text-sm font-medium flex items-center disabled:opacity-50 transition-colors"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedVerification(verification)
                                setRejectionReason('')
                              }}
                              className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 text-sm font-medium flex items-center transition-colors"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Empty State */}
            {paginatedVerifications.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6">
                  <FileCheck className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || filter !== 'all' ? 'No matching providers' : 'No pending verifications'}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'All providers are currently verified or have no pending documents.'}
                </p>
                <button
                  onClick={loadVerifications}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredVerifications.length)} of {filteredVerifications.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Footer */}
      <div className="mt-8 text-center text-sm text-gray-500 pb-8">
        <div className="flex items-center justify-center space-x-2">
          <Lock className="h-4 w-4" />
          <span>Secure Admin Portal • Database Validation • All actions logged</span>
        </div>
        <div className="mt-2 text-xs">
          Logged in as: <span className="font-medium text-gray-700">{adminInfo.email}</span> • 
          Role: <span className="font-medium text-gray-700">{adminInfo.role}</span>
        </div>
      </div>
    </div>
  )
}