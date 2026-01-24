// app/verify/page.tsx - COMPLETE FIXED VERSION
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  CheckCircle, AlertCircle, RefreshCw, Mail, Shield, 
  Loader2, User, Briefcase, ArrowRight, Lock
} from 'lucide-react'

export default function VerifyPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState<string>('')
  const [userType, setUserType] = useState<'customer' | 'provider'>('provider')
  const [otp, setOtp] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [countdown, setCountdown] = useState<number>(0)
  const [verificationStep, setVerificationStep] = useState<'enter_otp' | 'success' | 'error'>('enter_otp')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Load email and user type from URL params
    const urlEmail = searchParams.get('email')
    const urlUserType = searchParams.get('user_type') as 'customer' | 'provider'
    
    if (urlEmail) {
      setEmail(decodeURIComponent(urlEmail))
    }
    
    if (urlUserType && (urlUserType === 'customer' || urlUserType === 'provider')) {
      setUserType(urlUserType)
    } else {
      setUserType('provider')
    }
  }, [searchParams])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const startCountdown = () => {
    setCountdown(60)
  }

  // CRITICAL FIX: Properly update provider verification after OTP confirmation
  const updateProviderVerification = async (email: string) => {
    try {
      console.log('🔐 Updating provider verification status for:', email)
      
      // 1. Find the provider by email
      const { data: provider, error: findError } = await supabase
        .from('providers')
        .select('id, business_name, email, verification_status, user_id')
        .eq('email', email.trim())
        .single()

      if (findError) {
        console.error('Provider find error:', findError)
        throw new Error('Provider profile not found. Please contact support.')
      }

      console.log('Found provider:', {
        id: provider.id,
        name: provider.business_name,
        current_status: provider.verification_status
      })

      // 2. Update provider from 'pending_email' to 'unverified'
      const { data: updatedProvider, error: updateError } = await supabase
        .from('providers')
        .update({
          is_verified: false,
          verification_status: 'unverified', // ← Changed from 'pending_email' to 'unverified'
          verification_step: 'email_verified',
          updated_at: new Date().toISOString()
        })
        .eq('id', provider.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating provider:', updateError)
        throw new Error('Failed to update provider status')
      }

      console.log('✅ Provider status updated:', {
        id: updatedProvider.id,
        name: updatedProvider.business_name,
        new_status: updatedProvider.verification_status,
        is_verified: updatedProvider.is_verified,
        note: 'Provider will now appear on homepage as UNVERIFIED'
      })

      // 3. Update user metadata if user_id exists
      if (provider.user_id) {
        await supabase.auth.updateUser({
          data: {
            provider_id: provider.id,
            provider_status: 'unverified'
          }
        })
      }

      return updatedProvider

    } catch (error) {
      console.error('Error in updateProviderVerification:', error)
      throw error
    }
  }

  const createCustomerProfile = async (userId: string, email: string) => {
    try {
      console.log('📝 Creating customer profile for:', email)
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          display_name: email.split('@')[0],
          email: email,
          user_type: 'customer',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Error creating customer profile:', error)
      } else {
        console.log('✅ Customer profile created/updated')
      }

    } catch (error) {
      console.error('Error creating customer profile:', error)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!otp || otp.length !== 8) {
      setMessage('Please enter a valid 8-digit OTP code')
      return
    }

    if (!email) {
      setMessage('Email is required')
      return
    }

    setLoading(true)
    setMessage('Verifying OTP...')
    setVerificationStep('enter_otp')

    try {
      console.log('📧 Verifying OTP for:', email, 'Type:', userType)
      
      // TRY METHOD 1: Check otp_storage table (from our API)
      const { data: otpData, error: otpError } = await supabase
        .from('otp_storage')
        .select('*')
        .eq('email', email.trim())
        .eq('otp', otp.trim())
        .gt('expires_at', new Date().toISOString())
        .single()

      if (otpError || !otpData) {
        console.log('OTP not found in storage, trying Supabase auth...')
        
        // TRY METHOD 2: Supabase OTP verification
        const { data: authData, error: authError } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otp.trim(),
          type: 'signup'
        })

        if (authError) {
          throw new Error('Invalid or expired OTP. Please request a new one.')
        }

        console.log('✅ Supabase OTP verified')
      } else {
        console.log('✅ OTP verified from storage')
        
        // Clean up used OTP
        await supabase
          .from('otp_storage')
          .delete()
          .eq('email', email.trim())
          .eq('otp', otp.trim())
      }

      // Get user session to update metadata
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id

      console.log('✅ OTP verified successfully')
      
      // Handle based on user type
      if (userType === 'provider') {
        try {
          const updatedProvider = await updateProviderVerification(email)
          console.log('✅ Provider verification completed successfully')
          
          setVerificationStep('success')
          setMessage(`🎉 Email Verified Successfully!

✅ Your provider account is now active!
✅ You will appear on the Nimart marketplace as "Unverified"
✅ Your business is now visible to customers

📍 **Business Details:**
• Name: ${updatedProvider.business_name}
• Service: ${updatedProvider.service_type || 'Not specified'}
• Status: Unverified (Appears on marketplace)
• Map Location: Visible to customers

📋 **Next Steps:**
1. Login to your provider dashboard
2. Upload verification documents (ID, business registration, etc.)
3. Wait for admin approval (1-2 business days)
4. Once approved, you'll get the "Verified" badge

⏳ Redirecting to dashboard in 5 seconds...`)

          // Set cookies and redirect
          document.cookie = `user-type=provider; path=/; max-age=${7 * 24 * 60 * 60}`
          document.cookie = `provider-id=${updatedProvider.id}; path=/; max-age=${7 * 24 * 60 * 60}`
          
          setTimeout(() => {
            if (userId) {
              router.push('/provider/dashboard')
            } else {
              router.push('/login?redirect=/provider/dashboard')
            }
          }, 5000)

        } catch (providerError: any) {
          console.error('❌ Provider verification update failed:', providerError)
          setVerificationStep('error')
          setMessage(`✅ Email verified but provider profile update failed. 
Please contact support if you don't appear on the marketplace.`)
        }
      } else {
        // Customer verification
        if (userId) {
          await createCustomerProfile(userId, email)
        }
        
        setVerificationStep('success')
        setMessage('✅ Email verified successfully! Your customer account is now active.')
        
        document.cookie = `user-type=customer; path=/; max-age=${7 * 24 * 60 * 60}`
        
        setTimeout(() => {
          router.push('/')
        }, 3000)
      }
      
    } catch (error: any) {
      console.error('Verification error:', error)
      setVerificationStep('error')
      setMessage(error.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0) {
      setMessage(`Please wait ${countdown} seconds before requesting a new OTP`)
      return
    }

    if (!email) {
      setMessage('Please enter your email address first')
      return
    }

    setLoading(true)
    setMessage('Sending new OTP...')
    
    try {
      console.log('📧 Resending OTP to:', email)
      
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          type: userType === 'provider' ? 'provider_signup' : 'signup'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send OTP')
      }
      
      setMessage('✅ New OTP sent! Check your email (including spam folder).')
      startCountdown()
    } catch (error: any) {
      console.error('Resend OTP error:', error)
      setMessage(error.message || 'Failed to resend OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoToDashboard = () => {
    if (userType === 'provider') {
      router.push('/provider/dashboard')
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {verificationStep === 'success' ? 'Verification Complete!' : 'Verify Your Email'}
          </h2>
          <div className="flex items-center justify-center gap-2 mb-3">
            {userType === 'provider' ? (
              <>
                <Briefcase className="h-5 w-5 text-primary" />
                <span className="text-primary font-medium">Provider Account</span>
              </>
            ) : (
              <>
                <User className="h-5 w-5 text-primary" />
                <span className="text-primary font-medium">Customer Account</span>
              </>
            )}
          </div>
          
          {/* Email Display */}
          <div className="mb-6">
            <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <div className="flex items-center justify-center text-blue-600 mb-1">
                <Mail className="h-4 w-4 mr-2" />
                <p className="text-sm font-medium">Verification Email Sent To:</p>
              </div>
              <p className="text-blue-800 font-semibold mt-1 break-all">{email || 'Loading...'}</p>
            </div>
            <p className="text-gray-600 text-sm mt-3">
              {verificationStep === 'enter_otp' 
                ? 'Enter the 8-digit code from your email to activate your account'
                : 'Your account has been successfully verified!'}
            </p>
          </div>
        </div>

        {/* OTP Form - Only show in enter_otp step */}
        {verificationStep === 'enter_otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                8-digit Verification Code *
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="12345678"
                maxLength={8}
                required
                autoFocus
                disabled={loading}
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-500">Enter the 8-digit code from email</span>
                <span className="text-xs text-gray-500">{otp.length}/8 digits</span>
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || !otp || otp.length !== 8 || !email}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Verifying...
                </span>
              ) : `Verify & Activate ${userType === 'provider' ? 'Provider' : 'Customer'} Account`}
            </button>
          </form>
        )}

        {/* Success/Error Message Display */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg whitespace-pre-line ${message.includes('✅') || verificationStep === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start">
              {verificationStep === 'success' || message.includes('✅') ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <span className="text-sm">{message}</span>
            </div>
            
            {/* Success Actions */}
            {verificationStep === 'success' && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <button
                  onClick={handleGoToDashboard}
                  className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center transition-colors"
                >
                  Go to {userType === 'provider' ? 'Dashboard' : 'Homepage'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Resend OTP Section - Only show in enter_otp step */}
        {verificationStep === 'enter_otp' && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                onClick={handleResendOtp}
                disabled={loading || countdown > 0}
                className={`flex items-center px-4 py-2 rounded-lg ${countdown > 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-50 text-primary hover:bg-blue-100'} transition-colors`}
              >
                {countdown > 0 ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Resend in {countdown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resend Verification Code
                  </>
                )}
              </button>
              
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Back to Login
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Didn't receive the code? Check your spam folder or click "Resend"
              </p>
              <p className="text-xs text-gray-400 mt-1">
                The 8-digit code expires in 10 minutes
              </p>
            </div>
          </div>
        )}

        {/* Verification Steps Info */}
        {verificationStep === 'enter_otp' && userType === 'provider' && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Verification Steps
            </h4>
            <ol className="text-xs text-yellow-700 space-y-1">
              <li>1. Verify email with OTP → Appear as "Unverified" on marketplace</li>
              <li>2. Upload documents in dashboard → Awaiting admin review</li>
              <li>3. Admin approves → Get "Verified" badge</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}