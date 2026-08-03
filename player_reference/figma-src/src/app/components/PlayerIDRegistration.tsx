import { useState, useRef } from "react";
import {
  ArrowLeft, ChevronDown, Upload, Camera, ImageIcon,
  Shield, CheckCircle, BarChart2, Home, Loader2, X,
} from "lucide-react";

type RegStep = "form" | "verifying" | "success";

const ID_TYPES = ["Aadhaar", "Driving License", "Passport"];

function calcAge(dob: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

function generatePlayerId(): string {
  const num = Math.floor(10000 + Math.random() * 89999);
  return `SH-${num}`;
}

interface PlayerIDRegistrationProps {
  onBack: () => void;
  onViewRankings: () => void;
  onGoHome: () => void;
}

export function PlayerIDRegistration({ onBack, onViewRankings, onGoHome }: PlayerIDRegistrationProps) {
  const [step, setStep] = useState<RegStep>("form");
  const [playerId, setPlayerId] = useState("");

  // Form fields
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [idType, setIdType] = useState("");
  const [idTypeOpen, setIdTypeOpen] = useState(false);
  const [idNumber, setIdNumber] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const age = calcAge(dob);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!dob) e.dob = "Date of birth is required";
    if (age !== null && age < 10) e.dob = "Minimum age is 10 years";
    if (!idType) e.idType = "Please select an ID type";
    if (!idNumber.trim()) e.idNumber = "ID number is required";
    if (!uploadedImage) e.upload = "Please upload your ID proof";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGenerate = () => {
    if (!validate()) return;
    setStep("verifying");
    const id = generatePlayerId();
    setTimeout(() => {
      setPlayerId(id);
      setStep("success");
    }, 2200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string);
      setErrors((prev) => ({ ...prev, upload: "" }));
    };
    reader.readAsDataURL(file);
  };

  const inputBase = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all";
  const inputStyle = (field: string) => ({
    backgroundColor: "rgba(255,255,255,0.06)",
    border: `1.5px solid ${errors[field] ? "var(--live-red)" : "rgba(255,255,255,0.12)"}`,
    color: "#fff",
  });
  const labelStyle = { color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 500 };
  const errorStyle = { color: "var(--live-red)", fontSize: 11, marginTop: 4 };
  const cardStyle = {
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "20px 20px",
  };

  /* ── Verifying overlay ── */
  if (step === "verifying") {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-6"
        style={{ background: "linear-gradient(160deg, var(--navy) 0%, #0D2647 100%)" }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(167,255,63,0.1)", border: "2px solid rgba(167,255,63,0.3)" }}
        >
          <Loader2 size={32} style={{ color: "var(--lime)" }} className="animate-spin" />
        </div>
        <div className="text-center">
          <p className="font-bold text-xl text-white mb-2">Verifying your details...</p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Securely validating your ID proof
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-5 py-2.5 rounded-full"
          style={{ backgroundColor: "rgba(167,255,63,0.08)", border: "1px solid rgba(167,255,63,0.15)" }}
        >
          <Shield size={13} style={{ color: "var(--lime)" }} />
          <span className="text-xs" style={{ color: "var(--lime)" }}>256-bit Encrypted</span>
        </div>
      </div>
    );
  }

  /* ── Success ── */
  if (step === "success") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 py-10 text-center"
        style={{ background: "linear-gradient(160deg, var(--navy) 0%, #0D2647 100%)" }}
      >
        {/* Success icon */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: "rgba(167,255,63,0.12)", border: "2px solid rgba(167,255,63,0.35)" }}
        >
          <CheckCircle size={44} style={{ color: "var(--lime)" }} strokeWidth={1.8} />
        </div>

        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--lime)" }}>
          Verification Successful
        </p>
        <h1 className="text-white mb-6" style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>
          Your Player ID<br />is Ready!
        </h1>

        {/* Player ID display */}
        <div
          className="px-8 py-5 rounded-2xl mb-4"
          style={{
            background: "linear-gradient(135deg, rgba(167,255,63,0.15) 0%, rgba(167,255,63,0.06) 100%)",
            border: "2px solid rgba(167,255,63,0.4)",
          }}
        >
          <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Your Player ID</p>
          <p
            className="font-black tracking-widest"
            style={{ fontSize: 32, color: "var(--lime)", letterSpacing: "0.08em" }}
          >
            {playerId}
          </p>
        </div>

        <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
          This ID is now linked to your profile
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={onViewRankings}
            className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ backgroundColor: "var(--lime)", color: "var(--navy)" }}
          >
            <BarChart2 size={16} /> View Rankings
          </button>
          <button
            onClick={onGoHome}
            className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <Home size={16} /> Go to Home
          </button>
        </div>
      </div>
    );
  }

  /* ── Registration Form ── */
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(160deg, var(--navy) 0%, #0D2647 100%)", paddingBottom: 100 }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 lg:px-6 py-4 sticky top-0 z-30"
        style={{ backgroundColor: "rgba(11,31,58,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
        >
          <ArrowLeft size={16} color="#fff" />
        </button>
        <h1 className="text-white font-bold" style={{ fontSize: 17 }}>Create Your Player ID</h1>
      </div>

      <div className="flex-1 px-4 lg:px-6 py-5 flex flex-col gap-5 max-w-xl mx-auto w-full">

        {/* ── Section 1: Personal Details ── */}
        <div style={cardStyle}>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--lime)" }}>
            Personal Details
          </p>

          {/* Full Name */}
          <div className="flex flex-col gap-1.5 mb-4">
            <label style={labelStyle}>Full Name</label>
            <input
              className={inputBase}
              style={inputStyle("fullName")}
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: "" })); }}
            />
            {errors.fullName && <p style={errorStyle}>{errors.fullName}</p>}
          </div>

          {/* Date of Birth */}
          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Date of Birth</label>
            <input
              type="date"
              className={inputBase}
              style={{ ...inputStyle("dob"), colorScheme: "dark" }}
              value={dob}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => { setDob(e.target.value); setErrors((p) => ({ ...p, dob: "" })); }}
            />
            {dob && age !== null && (
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                Age: <span style={{ color: "var(--lime)", fontWeight: 600 }}>{age} years</span>
              </p>
            )}
            {errors.dob && <p style={errorStyle}>{errors.dob}</p>}
          </div>
        </div>

        {/* ── Section 2: ID Verification ── */}
        <div style={cardStyle}>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--lime)" }}>
            ID Verification
          </p>

          {/* ID Type dropdown */}
          <div className="flex flex-col gap-1.5 mb-4">
            <label style={labelStyle}>ID Proof Type</label>
            <div className="relative">
              <button
                onClick={() => setIdTypeOpen(!idTypeOpen)}
                className={`${inputBase} flex items-center justify-between`}
                style={inputStyle("idType")}
              >
                <span style={{ color: idType ? "#fff" : "rgba(255,255,255,0.3)" }}>
                  {idType || "Select ID type"}
                </span>
                <ChevronDown
                  size={15}
                  style={{ color: "rgba(255,255,255,0.4)", transform: idTypeOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
                />
              </button>
              {idTypeOpen && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20"
                  style={{ backgroundColor: "#162D52", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
                >
                  {ID_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setIdType(t); setIdTypeOpen(false); setErrors((p) => ({ ...p, idType: "" })); }}
                      className="w-full text-left px-4 py-3 text-sm transition-colors"
                      style={{
                        color: idType === t ? "var(--lime)" : "rgba(255,255,255,0.8)",
                        backgroundColor: idType === t ? "rgba(167,255,63,0.08)" : "transparent",
                        fontWeight: idType === t ? 600 : 400,
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.idType && <p style={errorStyle}>{errors.idType}</p>}
          </div>

          {/* ID Number */}
          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>ID Number</label>
            <input
              className={inputBase}
              style={inputStyle("idNumber")}
              placeholder="Enter your ID number"
              value={idNumber}
              onChange={(e) => { setIdNumber(e.target.value); setErrors((p) => ({ ...p, idNumber: "" })); }}
            />
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
              Only last 4 digits will be securely stored
            </p>
            {errors.idNumber && <p style={errorStyle}>{errors.idNumber}</p>}
          </div>
        </div>

        {/* ── Section 3: Upload ID ── */}
        <div style={cardStyle}>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--lime)" }}>
            Upload ID Proof
          </p>

          {uploadedImage ? (
            /* Image preview */
            <div className="relative">
              <img
                src={uploadedImage}
                alt="ID Proof"
                className="w-full rounded-xl object-cover"
                style={{ height: 180, border: "1.5px solid rgba(167,255,63,0.3)" }}
              />
              <button
                onClick={() => setUploadedImage(null)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              >
                <X size={13} color="#fff" />
              </button>
              <div
                className="absolute bottom-2 left-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: "rgba(167,255,63,0.15)", border: "1px solid rgba(167,255,63,0.3)" }}
              >
                <CheckCircle size={12} style={{ color: "var(--lime)" }} />
                <span className="text-xs font-semibold" style={{ color: "var(--lime)" }}>Uploaded</span>
              </div>
            </div>
          ) : (
            /* Upload area */
            <div>
              <div
                className="rounded-xl flex flex-col items-center justify-center gap-3 py-8 cursor-pointer"
                style={{
                  border: `2px dashed ${errors.upload ? "var(--live-red)" : "rgba(167,255,63,0.3)"}`,
                  backgroundColor: "rgba(167,255,63,0.04)",
                }}
                onClick={() => fileRef.current?.click()}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(167,255,63,0.1)" }}
                >
                  <Upload size={20} style={{ color: "var(--lime)" }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">Upload Image</p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                    JPG, PNG up to 5MB
                  </p>
                </div>
              </div>

              {/* Camera / Gallery options */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <Camera size={15} /> Camera
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <ImageIcon size={15} /> Gallery
                </button>
              </div>

              {errors.upload && <p style={{ ...errorStyle, marginTop: 8 }}>{errors.upload}</p>}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Security note */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ backgroundColor: "rgba(167,255,63,0.05)", border: "1px solid rgba(167,255,63,0.12)" }}
        >
          <Shield size={15} style={{ color: "var(--lime)", flexShrink: 0 }} />
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            Your data is secure and encrypted. We never share your personal information.
          </p>
        </div>
      </div>

      {/* ── Sticky CTA ── */}
      <div
        className="fixed bottom-[72px] lg:bottom-0 left-0 right-0 z-40 px-4 lg:px-6 py-3"
        style={{
          backgroundColor: "rgba(11,31,58,0.97)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
        }}
      >
        <div className="max-w-xl mx-auto">
          <button
            onClick={handleGenerate}
            className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ backgroundColor: "var(--lime)", color: "var(--navy)" }}
          >
            Generate Player ID →
          </button>
        </div>
      </div>
    </div>
  );
}
