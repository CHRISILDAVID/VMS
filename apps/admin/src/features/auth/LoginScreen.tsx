import React, { useState } from 'react';
import { Mail, ArrowRight, Shield, Loader2, Lock } from 'lucide-react';
import { useAdminAuth } from './useAdminAuth';

export default function LoginScreen() {
  const { signInWithEmail } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[540px]">
        {/* Brand Side */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 p-10 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
              🏸
            </div>
            <div>
              <div className="text-2xl font-extrabold tracking-tight">Venue OS</div>
              <div className="text-xs text-blue-100 font-medium">Badminton Venue Management</div>
            </div>
          </div>

          <div className="my-auto py-8 relative z-10">
            <h1 className="text-3xl font-extrabold leading-tight mb-4">
              Run your venue<br />smarter & faster
            </h1>
            <p className="text-sm text-blue-100 leading-relaxed font-normal">
              Complete desktop management system for badminton facility owners. Monitor court schedules, manage bookings, and track customer financials with ease.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-blue-200 relative z-10 font-medium">
            <Shield size={14} className="text-blue-200" />
            <span>Secure Admin Access powered by Supabase</span>
          </div>
        </div>

        {/* Form Side */}
        <div className="p-10 flex flex-col justify-center bg-white">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
              <Shield size={20} />
              <span>Admin Login</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-sm text-slate-500 mb-6">
              Enter your credentials to access the admin panel.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="flex items-center bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus-within:border-blue-600 focus-within:bg-white transition-all">
                  <Mail size={18} className="text-slate-400 mr-2" />
                  <input
                    type="email"
                    placeholder="admin@venueos.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-slate-900 font-semibold placeholder:text-slate-300"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="flex items-center bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus-within:border-blue-600 focus-within:bg-white transition-all">
                  <Lock size={18} className="text-slate-400 mr-2" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-slate-900 font-semibold placeholder:text-slate-300"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
