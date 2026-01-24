// lib/email-service.ts - COMPLETE FIXED VERSION
import { Resend } from 'resend';

// Check for environment variable
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error('❌ RESEND_API_KEY is not configured in environment variables');
  // Don't throw error - allow fallback to Supabase OTP
}

// Initialize Resend only if API key exists
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendNimartOtpEmail(email: string, otp: string, userName?: string) {
  try {
    console.log('📧 Attempting to send OTP via Resend to:', email);
    
    if (!resend) {
      console.warn('⚠️ Resend not configured, using fallback method');
      return { success: false, message: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: 'Nimart <no-reply@nimart.ng>',
      to: [email],
      replyTo: 'support@nimart.ng',
      subject: `Your Nimart Verification Code: ${otp}`,
      html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nimart Verification Code</title>
</head>
<body style="margin: 0; padding: 15px; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f7f9fc; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);">
        
        <div style="background-color: #008751; height: 4px;"></div>
        
        <div style="padding: 30px 20px;">
            <div style="text-align: center; margin-bottom: 25px;">
                <img src="https://jauxqeahsxxlcabjxdvb.supabase.co/storage/v1/object/public/email/new%20logo.png" alt="Nimart Logo" style="height: 40px; max-width: 150px;">
                <p style="margin-top: 5px; color: #666; font-size: 13px;">Secure Account Verification</p>
            </div>
            
            <h2 style="color: #222; margin-bottom: 8px; font-weight: 600; font-size: 18px;">Your Verification Code</h2>
            <p style="color: #555; line-height: 1.5; margin-bottom: 25px; font-size: 15px;">To complete your verification process, please use the following 8-digit code:</p>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f0f9f5; border-radius: 8px; border-left: 4px solid #008751;">
                <p style="margin-top: 0; color: #555; font-size: 13px; margin-bottom: 8px;">Enter this code on the verification page:</p>
                <div style="font-size: 32px; font-weight: 700; color: #008751; letter-spacing: 6px; padding: 8px; background-color: white; border-radius: 6px; display: inline-block; box-shadow: 0 3px 10px rgba(0, 135, 81, 0.1); word-break: break-all;">
                    ${otp}
                </div>
                <p style="margin-bottom: 0; color: #777; font-size: 13px; margin-top: 12px;">⏳ Code expires in <strong>10 minutes</strong></p>
            </div>
            
            <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee;">
                <p style="color: #777; font-size: 12px; text-align: center;">
                    🔒 <strong>Security Notice:</strong> Never share this code with anyone. Nimart will never ask for your password or verification code via email or phone.
                </p>
            </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-top: 1px solid #eee; position: relative;">
            <div style="text-align: right; margin-bottom: 15px;">
                <img src="https://jauxqeahsxxlcabjxdvb.supabase.co/storage/v1/object/public/email/new%20logo.png" alt="Nimart Logo" style="height: 20px; max-width: 80px; filter: grayscale(100%); opacity: 0.7;">
            </div>
            
            <div style="color: #777; font-size: 11px; line-height: 1.4; text-align: right;">
                <div style="margin-bottom: 6px;">
                    <strong>Nimart</strong> • Banex junction Wuse, Abuja Municipal Area Council 900001<br>
                    Federal Capital Territory, Nigeria
                </div>
                <div style="margin-bottom: 6px;">
                    <span style="color: #008751; margin-right: 6px;">✉️</span>
                    <a href="mailto:info@nimart.ng" style="color: #008751; text-decoration: none;">info@nimart.ng</a> 
                    <span style="margin: 0 6px;">|</span>
                    <span style="color: #008751; margin-right: 3px;">📞</span>
                    <a href="tel:+2348038887589" style="color: #008751; text-decoration: none;">+234 803 888 7589</a>
                </div>
                <div style="color: #aaa; margin-top: 10px; font-size: 10px; border-top: 1px solid #eee; padding-top: 8px;">
                    © ${new Date().getFullYear()} Nimart. All rights reserved.
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `Your Nimart Verification Code: ${otp}

Enter this 8-digit code on the verification page: ${otp}

This code expires in 10 minutes.

🔒 Security Notice: Never share this code with anyone. Nimart will never ask for your password or verification code via email or phone.

Nimart
Banex junction Wuse, Abuja
info@nimart.ng | +234 803 888 7589
© ${new Date().getFullYear()} Nimart. All rights reserved.`,
      headers: {
        'X-Entity-Ref-ID': `nimart-otp-${Date.now()}`,
        'List-Unsubscribe': '<https://nimart.ng/unsubscribe>',
        'X-Priority': '1',
        'X-Mailer': 'Nimart Platform',
      },
      tags: [
        { name: 'category', value: 'authentication' },
        { name: 'type', value: 'otp' },
      ],
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return { 
        success: false, 
        error: error.message,
        fallback: true 
      };
    }

    console.log('✅ OTP email sent via Resend, Message ID:', data?.id);
    return { 
      success: true, 
      messageId: data?.id,
      fallback: false 
    };

  } catch (error: any) {
    console.error('❌ Email sending error:', error);
    return { 
      success: false, 
      error: error.message,
      fallback: true 
    };
  }
}

// Fallback email function that logs OTP to console for development
export async function sendNimartOtpFallback(email: string, otp: string) {
  console.log('📧 [FALLBACK] OTP for', email, ':', otp);
  console.log('📧 [FALLBACK] OTP would be sent to:', email);
  console.log('📧 [FALLBACK] For production, configure RESEND_API_KEY environment variable');
  
  return { 
    success: true, 
    fallback: true,
    message: 'OTP logged to console (development mode)' 
  };
}