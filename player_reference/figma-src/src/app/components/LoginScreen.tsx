import { useState, useRef, useEffect } from "react";
import { Zap, ChevronRight, ArrowLeft, CheckCircle } from "lucide-react";

type Step = "phone" | "otp" | "success";

const countryCodes = [
  { code: "+60", flag: "🇲🇾", label: "MY" },
  { code: "+65", flag: "🇸🇬", label: "SG" },
  { code: "+62", flag: "🇮🇩", label: "ID" },
  { code: "+66", flag: "🇹🇭", label: "TH" },
  { code: "+91", flag: "🇮🇳", label: "IN" },
  { code: "+44", flag: "🇬🇧", label: "UK" },
  { code: "+1", flag: "🇺🇸", label: "US" },
];

interface LoginScreenProps {
  onLogin: (phone: string, name: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [step, setStep] = useState<Step>("phone");
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [showCountryList, setShowCountryList] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown for OTP resend
  useEffect(() => {
    if (step !== "otp") return;
    setResendTimer(30);
    setCanResend(false);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handleSendOtp = () => {
    if (phone.length < 8) {
      setError("Please enter a valid mobile number");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 1200);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError("");
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Enter the 6-digit code");
      return;
    }
    setError("");
    setLoading(true);
    // Simulate verification — accept any 6-digit code
    setTimeout(() => {
      setLoading(false);
      setStep("success");
      setTimeout(() => {
        onLogin(`${selectedCountry.code} ${phone}`, "Amir Hassan");
      }, 1400);
    }, 1000);
  };

  const fullPhone = `${selectedCountry.code} ${phone}`;

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Left — Branding Panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12"
        style={{
          width: 480,
          flexShrink: 0,
          background: "linear-gradient(160deg, var(--navy) 0%, #0D2647 60%, #0B1F3A 100%)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: "var(--lime)", borderRadius: 12 }}
            className="w-11 h-11 flex items-center justify-center"
          >
            <Zap size={20} style={{ color: "var(--navy)" }} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-white text-base font-bold tracking-wide">SHUTTLE</span>
            <span style={{ color: "var(--lime)" }} className="text-base font-bold tracking-wide">HUB</span>
          </div>
        </div>

        {/* Hero copy */}
        <div>
          <h1
            className="text-white mb-4"
            style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.15 }}
          >
            Your Badminton
            <br />
            <span style={{ color: "var(--lime)" }}>Super App</span>
          </h1>
          <p className="mb-10" style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, lineHeight: 1.7 }}>
            Book courts, find players, track live tournaments,
            climb the rankings — all in one place.
          </p>
          {/* Feature list */}
          <div className="flex flex-col gap-4">
            {[
              { icon: "🏸", label: "Court Booking & Scheduling" },
              { icon: "🏆", label: "Live Tournament Scoreboard" },
              { icon: "📊", label: "Global Player Rankings" },
              { icon: "🛒", label: "Pro Gear Shop" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(167,255,63,0.12)" }}
                >
                  <span className="text-base">{icon}</span>
                </div>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="grid grid-cols-3 gap-4 p-5 rounded-2xl"
          style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {[
            { value: "120K+", label: "Players" },
            { value: "4,800+", label: "Courts" },
            { value: "900+", label: "Tournaments" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-black text-white" style={{ fontSize: 22 }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Auth Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Mobile Logo (hidden on desktop) */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div style={{ backgroundColor: "var(--navy)", borderRadius: 10 }} className="w-9 h-9 flex items-center justify-center">
              <Zap size={16} style={{ color: "var(--lime)" }} strokeWidth={2.5} />
            </div>
            <span className="font-bold" style={{ color: "var(--navy)" }}>ShuttleHub</span>
          </div>

          {/* ── STEP: Phone ── */}
          {step === "phone" && (
            <div>
              <h2 className="mb-1" style={{ fontSize: 26, fontWeight: 700, color: "var(--foreground)" }}>
                Welcome back 👋
              </h2>
              <p className="mb-8 text-sm" style={{ color: "var(--muted-foreground)" }}>
                Enter your mobile number to sign in or create an account
              </p>

              <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                Mobile Number
              </label>

              <div className="flex gap-2 mb-5">
                {/* Country code picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowCountryList(!showCountryList)}
                    className="flex items-center gap-2 px-3 py-3.5 rounded-xl text-sm font-medium h-full"
                    style={{
                      backgroundColor: "var(--input-background)",
                      border: `1.5px solid ${showCountryList ? "var(--navy)" : "var(--border)"}`,
                      color: "var(--foreground)",
                      minWidth: 88,
                    }}
                  >
                    <span>{selectedCountry.flag}</span>
                    <span>{selectedCountry.code}</span>
                  </button>
                  {showCountryList && (
                    <div
                      className="absolute top-full left-0 mt-1 rounded-xl overflow-hidden z-50"
                      style={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                        minWidth: 160,
                      }}
                    >
                      {countryCodes.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => { setSelectedCountry(c); setShowCountryList(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#F8FAFC] transition-colors"
                          style={{
                            backgroundColor: c.code === selectedCountry.code ? "var(--muted)" : "transparent",
                            color: "var(--foreground)",
                          }}
                        >
                          <span className="text-base">{c.flag}</span>
                          <span style={{ color: "var(--muted-foreground)" }}>{c.code}</span>
                          <span>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone input */}
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  placeholder="12-345 6789"
                  className="flex-1 px-4 py-3.5 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: "var(--input-background)",
                    border: `1.5px solid ${error ? "var(--live-red)" : "var(--border)"}`,
                    color: "var(--foreground)",
                  }}
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-xs mb-4" style={{ color: "var(--live-red)" }}>{error}</p>
              )}

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all"
                style={{
                  backgroundColor: loading ? "var(--muted)" : "var(--navy)",
                  color: loading ? "var(--muted-foreground)" : "var(--lime)",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Sending OTP…
                  </span>
                ) : (
                  <>Send OTP <ChevronRight size={15} /></>
                )}
              </button>

              <p className="text-xs text-center mt-6" style={{ color: "var(--muted-foreground)" }}>
                By continuing, you agree to our{" "}
                <span className="underline cursor-pointer" style={{ color: "var(--navy)" }}>Terms of Service</span>
                {" "}and{" "}
                <span className="underline cursor-pointer" style={{ color: "var(--navy)" }}>Privacy Policy</span>
              </p>
            </div>
          )}

          {/* ── STEP: OTP ── */}
          {step === "otp" && (
            <div>
              <button
                onClick={() => setStep("phone")}
                className="flex items-center gap-1.5 text-sm mb-8"
                style={{ color: "var(--muted-foreground)" }}
              >
                <ArrowLeft size={15} /> Back
              </button>

              <h2 className="mb-1" style={{ fontSize: 26, fontWeight: 700, color: "var(--foreground)" }}>
                Verify your number
              </h2>
              <p className="mb-8 text-sm" style={{ color: "var(--muted-foreground)" }}>
                We sent a 6-digit code to{" "}
                <span style={{ color: "var(--navy)", fontWeight: 600 }}>{fullPhone}</span>
              </p>

              {/* OTP Boxes */}
              <div className="flex gap-2 sm:gap-3 justify-center mb-5">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="text-center text-xl font-bold rounded-xl outline-none transition-all"
                    style={{
                      width: "clamp(40px, 13vw, 52px)",
                      height: "clamp(48px, 14vw, 60px)",
                      backgroundColor: digit ? "var(--navy)" : "var(--input-background)",
                      color: digit ? "var(--lime)" : "var(--foreground)",
                      border: `2px solid ${error ? "var(--live-red)" : digit ? "var(--navy)" : "var(--border)"}`,
                    }}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {error && (
                <p className="text-xs text-center mb-4" style={{ color: "var(--live-red)" }}>{error}</p>
              )}

              <button
                onClick={handleVerify}
                disabled={loading || otp.join("").length < 6}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold mb-5 transition-all"
                style={{
                  backgroundColor: otp.join("").length === 6 && !loading ? "var(--navy)" : "var(--muted)",
                  color: otp.join("").length === 6 && !loading ? "var(--lime)" : "var(--muted-foreground)",
                  cursor: otp.join("").length === 6 && !loading ? "pointer" : "not-allowed",
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Verifying…
                  </span>
                ) : (
                  <>Verify & Continue <ChevronRight size={15} /></>
                )}
              </button>

              <div className="text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                {canResend ? (
                  <button
                    onClick={() => { setOtp(["", "", "", "", "", ""]); setStep("otp"); }}
                    style={{ color: "var(--navy)", fontWeight: 600 }}
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span>
                    Resend in{" "}
                    <span style={{ color: "var(--navy)", fontWeight: 600 }}>0:{String(resendTimer).padStart(2, "0")}</span>
                  </span>
                )}
              </div>

              <div
                className="mt-6 p-4 rounded-xl flex items-start gap-3"
                style={{ backgroundColor: "var(--muted)" }}
              >
                <span className="text-base mt-0.5">💡</span>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  For demo purposes, enter <strong style={{ color: "var(--navy)" }}>any 6 digits</strong> to proceed.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP: Success ── */}
          {step === "success" && (
            <div className="flex flex-col items-center text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: "rgba(16,185,129,0.1)" }}
              >
                <CheckCircle size={40} style={{ color: "var(--win-green)" }} strokeWidth={1.5} />
              </div>
              <h2 className="mb-2" style={{ fontSize: 24, fontWeight: 700, color: "var(--foreground)" }}>
                Verified!
              </h2>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Welcome to ShuttleHub. Taking you in…
              </p>
              <div className="flex gap-1.5 mt-8">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: "var(--navy)",
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
