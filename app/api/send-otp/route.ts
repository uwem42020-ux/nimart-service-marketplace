// app/api/send-otp/route.ts - COMPLETE FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendNimartOtpEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email, type = 'signup' } = await request.json();
    
    console.log('📧 API: Sending OTP to:', email, 'Type:', type);
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Generate 8-digit OTP
    const otp = Math.floor(10000000 + Math.random() * 90000000).toString();
    console.log('Generated OTP:', otp);
    
    // Clean up any existing OTPs for this email first
    await supabase
      .from('otp_storage')
      .delete()
      .eq('email', email.trim());

    // CRITICAL FIX: Store OTP in database with proper expiration
    const { error: dbError } = await supabase
      .from('otp_storage')
      .insert({
        email: email.trim(),
        otp: otp,
        type: type,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('❌ Database error storing OTP:', dbError);
      return NextResponse.json(
        { error: 'Failed to store verification code' },
        { status: 500 }
      );
    }

    console.log('✅ OTP stored in database for:', email);

    // Try to send via Supabase auth (optional)
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nimart.ng';
      await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${appUrl}/verify`,
        }
      });
      console.log('✅ Supabase OTP sent');
    } catch (supabaseError: any) {
      console.log('Supabase OTP fallback (non-critical):', supabaseError.message);
    }

    // Send beautiful email via Resend
    try {
      await sendNimartOtpEmail(email, otp);
      console.log('✅ Resend email sent');
    } catch (emailError: any) {
      console.error('❌ Email sending error:', emailError);
      // Still return success because OTP is stored in database
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent successfully',
      note: 'Check your inbox (and spam folder if not found)',
      expires_in: '10 minutes'
    });

  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send verification code',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS method for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}