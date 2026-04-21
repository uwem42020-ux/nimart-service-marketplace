// src/pages/auth/ResetPassword.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, CheckCircle, Send } from 'lucide-react';
import { NimartSpinner } from '../../components/common/NimartSpinner';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false); // true when setting new password
  const [emailSent, setEmailSent] = useState(false);

  // Check if we have a recovery token in the URL (user clicked email link)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setIsResetMode(true);
    }
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setEmailSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password updated successfully!');
      // Sign out and redirect to sign in
      await supabase.auth.signOut();
      navigate('/auth/signin');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <NimartSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/loginbg.jpg")' }}
      />
      <div className="fixed inset-0 bg-black/40" />

      {/* Back Button */}
      <Link
        to="/auth/signin"
        className="fixed top-6 left-6 z-20 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition"
        aria-label="Back to sign in"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      <div className="relative z-10 flex min-h-screen items-start justify-center px-4 pt-4 pb-8">
        <div className="w-full max-w-md">
          <div className="bg-white/85 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
            <div className="flex justify-center mb-4">
              <img
                src="https://qootzfndochmcoijnwxf.supabase.co/storage/v1/object/public/logo/logo.png"
                alt="Nimart"
                className="h-10 sm:h-12 w-auto"
              />
            </div>

            <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
              {isResetMode ? 'Set New Password' : 'Reset Your Password'}
            </h2>

            {!isResetMode ? (
              // REQUEST RESET FORM
              <>
                {!emailSent ? (
                  <form onSubmit={handleRequestReset} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 disabled:opacity-50 transition font-medium flex items-center justify-center gap-2"
                    >
                      <Send className="h-5 w-5" />
                      Send Reset Link
                    </button>
                    <p className="text-sm text-center text-gray-600">
                      Remember your password?{' '}
                      <Link to="/auth/signin" className="text-primary-600 hover:underline font-medium">
                        Sign in
                      </Link>
                    </p>
                  </form>
                ) : (
                  // SUCCESS MESSAGE AFTER EMAIL SENT
                  <div className="text-center space-y-4">
                    <div className="bg-green-50 rounded-full p-3 w-16 h-16 mx-auto flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
                    <p className="text-sm text-gray-600">
                      We've sent a password reset link to <span className="font-medium">{email}</span>.
                    </p>
                    <p className="text-xs text-gray-500">
                      Didn't receive it? Check spam or{' '}
                      <button
                        onClick={() => setEmailSent(false)}
                        className="text-primary-600 hover:underline"
                      >
                        try again
                      </button>
                    </p>
                    <Link
                      to="/auth/signin"
                      className="block w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition font-medium mt-6"
                    >
                      Back to Sign In
                    </Link>
                  </div>
                )}
              </>
            ) : (
              // SET NEW PASSWORD FORM
              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 disabled:opacity-50 transition font-medium"
                >
                  Update Password
                </button>

                <p className="text-sm text-center text-gray-600">
                  <Link to="/auth/signin" className="text-primary-600 hover:underline font-medium">
                    Back to Sign In
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}