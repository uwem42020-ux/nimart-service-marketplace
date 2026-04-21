// src/pages/auth/SignIn.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { NimartSpinner } from '../../components/common/NimartSpinner';

export default function SignIn() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'password' | 'otp'>('otp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Signed in successfully');

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      navigate(profile?.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      toast.success('OTP sent to your email');
      setStep('otp');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (error) throw error;
      toast.success('Signed in successfully');

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      navigate(profile?.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
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
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/loginbg.jpg")' }}
      />
      <div className="fixed inset-0 bg-black/40" />

      <Link
        to="/"
        className="fixed top-6 left-6 z-20 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition"
        aria-label="Back to home"
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
              Sign in to your account
            </h2>

            <div className="flex mb-6 border-b border-gray-200">
              <button
                className={`flex-1 py-2 text-sm font-medium transition ${
                  mode === 'otp'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => {
                  setMode('otp');
                  setStep('email');
                }}
              >
                Sign in with OTP
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium transition ${
                  mode === 'password'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setMode('password')}
              >
                Sign in with Password
              </button>
            </div>

            {mode === 'password' ? (
              <form onSubmit={handlePasswordSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="••••••••"
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
                <div className="text-right">
                  <Link
                    to="/auth/reset-password"
                    className="text-sm text-primary-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 disabled:opacity-50 transition font-medium"
                >
                  Sign In
                </button>
              </form>
            ) : (
              <>
                {step === 'email' ? (
                  <form onSubmit={sendOTP} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
                      className="w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 disabled:opacity-50 transition font-medium"
                    >
                      Send OTP
                    </button>
                  </form>
                ) : (
                  <form onSubmit={verifyOTP} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-3 py-3 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-widest font-mono"
                        placeholder="00000000"
                        maxLength={8}
                      />
                      <p className="mt-2 text-xs text-gray-600 text-center">
                        We sent an 8‑digit code to <span className="font-medium">{email}</span>
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 disabled:opacity-50 transition font-medium"
                    >
                      Verify & Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="w-full flex items-center justify-center gap-1 text-sm text-primary-600 hover:underline font-medium"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to email
                    </button>
                  </form>
                )}
              </>
            )}

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/50 backdrop-blur-sm text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white/70 backdrop-blur-sm border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-white/90 transition font-medium"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <p className="mt-6 text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <Link to="/auth/signup" className="text-primary-600 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}