import React, { useState } from 'react';
import { Smartphone, ArrowRight, Shield, Loader2 } from 'lucide-react';
import { useAdminAuth } from './useAdminAuth';

export default function LoginScreen() {
  const { signInWithOtp, verifyOtp } = useAdminAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Supabase 6 digit OTP by default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signInWithOtp(phone);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join('');
    if (token.length < 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(phone, token);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
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
            <span>Secure OTP verification powered by Supabase</span>
          </div>
        </div>

        {/* Form Side */}
        <div className="p-10 flex flex-col justify-center bg-white">
          {step === 'phone' ? (
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
                <Smartphone size={20} />
                <span>Admin Login</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Enter mobile number</h2>
              <p className="text-sm text-slate-500 mb-6">
                We'll send a one-time password (OTP) via SMS to verify your account.
              </p>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Mobile Number
                  </label>
                  <div className="flex items-center bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus-within:border-blue-600 focus-within:bg-white transition-all">
                    <span className="text-slate-400 font-semibold mr-2">+91</span>
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="bg-transparent border-none outline-none w-full text-slate-900 font-semibold placeholder:text-slate-300"
                      autoFocus
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
                  disabled={loading || phone.length < 10}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
                <Shield size={20} />
                <span>Verification</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Enter OTP</h2>
              <p className="text-sm text-slate-500 mb-6">
                Enter the 6-digit verification code sent to <strong className="text-slate-800">+91 {phone}</strong>
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex gap-2 justify-between">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white outline-none text-slate-900 transition-all"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading || otp.join('').length < 6}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <span>Verify & Login</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setError(null);
                      setOtp(['', '', '', '', '', '']);
                    }}
                    className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Change mobile number
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
