import { useState } from "react";
import {
  ArrowLeft, CreditCard, Smartphone, Building2, Lock,
  CheckCircle, XCircle, RefreshCw, ShoppingBag, ChevronRight,
} from "lucide-react";
import type { CartItem, OrderAddress } from "../types/shop";

type PayMethod = "upi" | "card" | "netbanking";
type PayState = "form" | "processing" | "success" | "failed";

const banks = [
  { name: "Maybank", short: "MAY", color: "#FFD700" },
  { name: "CIMB", short: "CIM", color: "#EF4444" },
  { name: "Public Bank", short: "PUB", color: "#1E40AF" },
  { name: "RHB Bank", short: "RHB", color: "#F97316" },
  { name: "Hong Leong", short: "HLB", color: "#16A34A" },
  { name: "AmBank", short: "AMB", color: "#6366F1" },
  { name: "BSN", short: "BSN", color: "#0EA5E9" },
  { name: "Bank Rakyat", short: "BKR", color: "#BE185D" },
];

interface PaymentScreenProps {
  cartItems: CartItem[];
  address: OrderAddress;
  onBack: () => void;
  onSuccess: (paymentMethod: string) => void;
  onFail: () => void;
}

export function PaymentScreen({ cartItems, address, onBack, onSuccess, onFail }: PaymentScreenProps) {
  const [method, setMethod] = useState<PayMethod>("upi");
  const [payState, setPayState] = useState<PayState>("form");
  const [upiId, setUpiId] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState<number | null>(null);

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= 100 ? 0 : 10;
  const total = subtotal + deliveryFee;

  const formatCard = (v: string) => v.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const handlePay = () => {
    setPayState("processing");
    setTimeout(() => {
      // 90% success rate simulation
      const success = Math.random() > 0.1;
      if (success) {
        const label = method === "upi" ? `UPI · ${upiId}` : method === "card" ? `Card ····${cardNum.replace(/\s/g, "").slice(-4)}` : `Net Banking · ${banks[selectedBank ?? 0]?.name}`;
        setPayState("success");
        setTimeout(() => onSuccess(label), 1200);
      } else {
        setPayState("failed");
      }
    }, 2200);
  };

  const canPay =
    (method === "upi" && upiId.includes("@")) ||
    (method === "card" && cardNum.replace(/\s/g, "").length === 16 && expiry.length === 5 && cvv.length === 3 && cardName.length > 2) ||
    (method === "netbanking" && selectedBank !== null);

  const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none";
  const inputSty = { backgroundColor: "var(--input-background)", border: "1px solid var(--border)", color: "var(--foreground)" };

  /* ── Processing overlay ── */
  if (payState === "processing") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6" style={{ backgroundColor: "var(--background)" }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(11,31,58,0.08)" }}>
          <RefreshCw size={32} style={{ color: "var(--navy)" }} className="animate-spin" />
        </div>
        <div className="text-center">
          <p className="font-bold text-lg" style={{ color: "var(--foreground)" }}>Processing Payment</p>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Please wait, do not close this window…</p>
        </div>
        <div
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm"
          style={{ backgroundColor: "rgba(11,31,58,0.05)", color: "var(--muted-foreground)" }}
        >
          <Lock size={14} style={{ color: "var(--navy)" }} />
          Secured by ShuttleHub Pay
        </div>
      </div>
    );
  }

  /* ── Success ── */
  if (payState === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6" style={{ backgroundColor: "var(--background)" }}>
        <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
          <CheckCircle size={48} style={{ color: "var(--win-green)" }} strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p className="font-black text-2xl mb-2" style={{ color: "var(--foreground)" }}>Payment Successful! 🎉</p>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Your order has been placed successfully.</p>
        </div>
        <div className="w-full max-w-sm p-5 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex flex-col gap-2">
            {[
              ["Amount Paid", `RM ${total.toFixed(0)}`],
              ["Delivery To", address.city],
              ["Estimated Delivery", "2–4 business days"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
                <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{k}</span>
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
          Redirecting to order confirmation…
        </p>
      </div>
    );
  }

  /* ── Failed ── */
  if (payState === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6" style={{ backgroundColor: "var(--background)" }}>
        <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
          <XCircle size={48} style={{ color: "var(--live-red)" }} strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p className="font-black text-2xl mb-2" style={{ color: "var(--foreground)" }}>Payment Failed</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Your transaction could not be completed.<br />Please check your details and try again.
          </p>
        </div>
        <div
          className="w-full max-w-sm px-5 py-4 rounded-2xl text-sm"
          style={{ backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--foreground)" }}
        >
          <p className="font-semibold mb-1">Possible reasons:</p>
          <ul className="list-disc list-inside space-y-0.5" style={{ color: "var(--muted-foreground)" }}>
            <li>Insufficient balance</li>
            <li>Bank declined the transaction</li>
            <li>Network timeout</li>
          </ul>
        </div>
        <div className="flex gap-3 w-full max-w-sm">
          <button onClick={() => setPayState("form")} className="flex-1 py-3.5 rounded-2xl text-sm font-bold" style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}>
            Try Again
          </button>
          <button onClick={() => { setPayState("form"); setMethod("card"); }} className="flex-1 py-3.5 rounded-2xl text-sm font-semibold" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}>
            Change Method
          </button>
        </div>
      </div>
    );
  }

  /* ── Payment Form ── */
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      {/* Left — Payment methods */}
      <div className="flex-1 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--muted)" }}>
            <ArrowLeft size={16} style={{ color: "var(--foreground)" }} />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--foreground)" }}>Payment</h1>
          <div className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <Lock size={12} style={{ color: "var(--navy)" }} />
            Secure Payment
          </div>
        </div>

        {/* Method Tabs */}
        <div className="grid grid-cols-3 p-1 rounded-2xl gap-1" style={{ backgroundColor: "var(--muted)" }}>
          {([["upi", Smartphone, "UPI"], ["card", CreditCard, "Cards"], ["netbanking", Building2, "Net Banking"]] as const).map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => setMethod(id)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all"
              style={{ backgroundColor: method === id ? "var(--navy)" : "transparent", color: method === id ? "var(--lime)" : "var(--muted-foreground)", fontWeight: method === id ? 700 : 400 }}
            >
              <Icon size={15} />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>

        {/* UPI */}
        {method === "upi" && (
          <div className="p-5 rounded-2xl flex flex-col gap-4" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <div>
              <h2 className="font-bold mb-1" style={{ color: "var(--foreground)" }}>Pay via UPI</h2>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Enter your UPI ID to make a direct bank payment</p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>UPI ID</label>
              <input
                className={inputCls}
                style={inputSty}
                placeholder="yourname@okaxis"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>Supports GPay, PhonePe, Paytm, BHIM and all UPI apps</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                <div key={app} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}>
                  <Smartphone size={12} /> {app}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card */}
        {method === "card" && (
          <div className="p-5 rounded-2xl flex flex-col gap-4" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <div>
              <h2 className="font-bold mb-1" style={{ color: "var(--foreground)" }}>Debit / Credit Card</h2>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Visa, Mastercard, and American Express accepted</p>
            </div>

            {/* Card preview */}
            <div
              className="relative p-5 rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, var(--navy) 0%, #162D52 100%)", aspectRatio: "1.6/1" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: "var(--lime)", opacity: 0.9 }} />
                <CreditCard size={24} style={{ color: "rgba(255,255,255,0.4)" }} />
              </div>
              <p className="text-white font-mono text-lg tracking-widest mb-4">
                {cardNum || "•••• •••• •••• ••••"}
              </p>
              <div className="flex justify-between">
                <div>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>CARD HOLDER</p>
                  <p className="text-sm font-medium text-white">{cardName || "YOUR NAME"}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>EXPIRES</p>
                  <p className="text-sm font-medium text-white">{expiry || "MM/YY"}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <input className={inputCls} style={inputSty} placeholder="Card Number" value={cardNum} onChange={(e) => setCardNum(formatCard(e.target.value))} maxLength={19} />
              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} style={inputSty} placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} maxLength={5} />
                <input className={inputCls} style={inputSty} placeholder="CVV" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))} maxLength={3} type="password" />
              </div>
              <input className={inputCls} style={inputSty} placeholder="Name on Card" value={cardName} onChange={(e) => setCardName(e.target.value)} />
            </div>
          </div>
        )}

        {/* Net Banking */}
        {method === "netbanking" && (
          <div className="p-5 rounded-2xl flex flex-col gap-4" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <div>
              <h2 className="font-bold mb-1" style={{ color: "var(--foreground)" }}>Net Banking</h2>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Select your bank to proceed with internet banking</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {banks.map((bank, i) => (
                <button
                  key={bank.name}
                  onClick={() => setSelectedBank(i)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
                  style={{
                    backgroundColor: selectedBank === i ? "rgba(11,31,58,0.06)" : "var(--background)",
                    border: `2px solid ${selectedBank === i ? "var(--navy)" : "var(--border)"}`,
                  }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white" style={{ backgroundColor: bank.color }}>
                    {bank.short}
                  </div>
                  <span className="text-xs text-center leading-tight" style={{ color: "var(--foreground)", fontWeight: selectedBank === i ? 600 : 400 }}>
                    {bank.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right — Order summary + Pay */}
      <div className="w-full lg:w-[320px] lg:flex-shrink-0">
        <div className="p-5 rounded-2xl sticky top-20 flex flex-col gap-4" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <h2 className="font-bold" style={{ color: "var(--foreground)", fontSize: 15 }}>Payment Summary</h2>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--muted-foreground)" }}>Subtotal</span>
              <span style={{ fontWeight: 600, color: "var(--foreground)" }}>RM {subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--muted-foreground)" }}>Delivery</span>
              <span style={{ fontWeight: 600, color: deliveryFee === 0 ? "var(--win-green)" : "var(--foreground)" }}>{deliveryFee === 0 ? "FREE" : `RM ${deliveryFee}`}</span>
            </div>
            <div style={{ borderTop: "1px solid var(--border)" }} className="pt-2 flex justify-between">
              <span className="font-bold" style={{ color: "var(--foreground)" }}>Total</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: "var(--navy)" }}>RM {total.toFixed(0)}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>DELIVERING TO</p>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{address.name}</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{address.line1}, {address.city}</p>
          </div>

          <button
            onClick={handlePay}
            disabled={!canPay}
            className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
            style={{
              backgroundColor: canPay ? "var(--navy)" : "var(--muted)",
              color: canPay ? "var(--lime)" : "var(--muted-foreground)",
              cursor: canPay ? "pointer" : "not-allowed",
            }}
          >
            <Lock size={14} />
            Pay RM {total.toFixed(0)}
          </button>

          <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
            🔒 256-bit SSL encrypted · Your data is safe
          </p>
        </div>
      </div>
    </div>
  );
}
