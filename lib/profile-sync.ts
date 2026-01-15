// lib/profile-sync.ts
import { supabase } from './supabase'

export interface UserProfileInfo {
  displayName: string
  userType: 'customer' | 'provider' | 'unknown'
  providerId?: string
  email?: string
}

/**
 * Ensures a profile exists for a user in the profiles table
 * Creates one if missing
 */
export async function ensureUserProfile(userId: string): Promise<boolean> {
  try {
    console.log('🔍 Ensuring profile exists for user:', userId)
    
    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single()

    // Profile exists, return true
    if (existingProfile) {
      console.log('✅ Profile already exists for user:', userId)
      return true
    }

    // If error is not "no rows found", something else is wrong
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking profile:', checkError)
      // Continue to create profile anyway
    }

    console.log('📝 Creating missing profile for user:', userId)
    
    // Profile doesn't exist, create one
    // First try to get user from auth
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    let userData = null
    if (!userError && user?.id === userId) {
      userData = user
    } else {
      // Fallback: try to get user by ID
      const { data: adminData } = await supabase.auth.admin.getUserById(userId)
      userData = adminData?.user
    }

    if (!userData) {
      console.warn('⚠️ User not found in auth, creating minimal profile')
      // Fallback: use minimal data
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          display_name: 'User',
          email: '',
          user_type: 'customer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error creating minimal profile:', insertError)
        return false
      }

      console.log('✅ Created minimal profile for user:', userId)
      return true
    }

    // Use actual user data
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        display_name: userData.user_metadata?.name || 
                     userData.user_metadata?.business_name || 
                     userData.email?.split('@')[0] || 'User',
        email: userData.email || '',
        avatar_url: userData.user_metadata?.avatar_url || null,
        phone: userData.user_metadata?.phone || null,
        user_type: userData.user_metadata?.user_type || 'customer',
        provider_id: userData.user_metadata?.provider_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error creating profile:', insertError)
      
      // If duplicate key, profile might have been created by another process
      if (insertError.code === '23505') {
        console.log('✅ Profile already exists (duplicate key)')
        return true
      }
      
      return false
    }

    console.log('✅ Created profile for user:', userId, 'Name:', userData.user_metadata?.name || userData.email)
    return true
  } catch (error) {
    console.error('Error ensuring user profile:', error)
    return false
  }
}

/**
 * Ensure profiles exist for multiple users
 */
export async function ensureMultipleProfiles(userIds: string[]): Promise<boolean> {
  try {
    console.log('🔍 Ensuring profiles for', userIds.length, 'users')
    const promises = userIds.map(userId => ensureUserProfile(userId))
    const results = await Promise.all(promises)
    const success = results.every(result => result === true)
    console.log('✅ Profile ensure results:', success ? 'All successful' : 'Some failed')
    return success
  } catch (error) {
    console.error('Error ensuring multiple profiles:', error)
    return false
  }
}

/**
 * Get user display name with fallback
 */
export async function getUserDisplayName(userId: string): Promise<string> {
  try {
    // First try to get from profiles
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', userId)
      .single()

    if (!error && profile?.display_name) {
      return profile.display_name
    }

    // Fallback to auth user metadata
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id === userId) {
      return user.user_metadata?.name || 
             user.user_metadata?.business_name || 
             user.email?.split('@')[0] || 'User'
    }

    // Try admin API as last resort
    const { data: userData } = await supabase.auth.admin.getUserById(userId)
    if (userData?.user) {
      return userData.user.user_metadata?.name || 
             userData.user.user_metadata?.business_name || 
             userData.user.email?.split('@')[0] || 'User'
    }

    return 'User'
  } catch (error) {
    console.error('Error getting user display name:', error)
    return 'User'
  }
}

/**
 * Get comprehensive user info
 */
export async function getUserInfo(userId: string): Promise<UserProfileInfo> {
  try {
    // First try to get from profiles
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('display_name, user_type, provider_id, email')
      .eq('user_id', userId)
      .single()

    if (!error && profile) {
      return {
        displayName: profile.display_name || 'User',
        userType: (profile.user_type as 'customer' | 'provider') || 'unknown',
        providerId: profile.provider_id || undefined,
        email: profile.email || undefined
      }
    }

    // Fallback to auth user metadata
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id === userId) {
      return {
        displayName: user.user_metadata?.name || 
                    user.user_metadata?.business_name || 
                    user.email?.split('@')[0] || 'User',
        userType: user.user_metadata?.user_type || 'customer',
        providerId: user.user_metadata?.provider_id,
        email: user.email
      }
    }

    // Try admin API
    const { data: userData } = await supabase.auth.admin.getUserById(userId)
    if (userData?.user) {
      return {
        displayName: userData.user.user_metadata?.name || 
                    userData.user.user_metadata?.business_name || 
                    userData.user.email?.split('@')[0] || 'User',
        userType: userData.user.user_metadata?.user_type || 'customer',
        providerId: userData.user.user_metadata?.provider_id,
        email: userData.user.email
      }
    }

    return {
      displayName: 'User',
      userType: 'unknown'
    }
  } catch (error) {
    console.error('Error getting user info:', error)
    return {
      displayName: 'User',
      userType: 'unknown'
    }
  }
}

/**
 * Get user profile or create if doesn't exist
 */
export async function getOrCreateUserProfile(userId: string) {
  try {
    await ensureUserProfile(userId)
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return profile
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

/**
 * Batch create profiles for multiple users
 */
export async function batchCreateProfiles(userIds: string[]): Promise<{success: string[], failed: string[]}> {
  const success: string[] = []
  const failed: string[] = []

  for (const userId of userIds) {
    try {
      const result = await ensureUserProfile(userId)
      if (result) {
        success.push(userId)
      } else {
        failed.push(userId)
      }
    } catch (error) {
      console.error(`Failed to create profile for ${userId}:`, error)
      failed.push(userId)
    }
  }

  console.log(`✅ Batch profile creation: ${success.length} success, ${failed.length} failed`)
  return { success, failed }
}