import { useState } from "react";
import { ArrowLeft, MapPin, Plus, Check, Phone } from "lucide-react";
import type { CartItem, OrderAddress } from "../types/shop";

const savedAddresses: OrderAddress[] = [
  { name: "Amir Hassan", line1: "12-A, Jalan Masjid India", line2: "Chow Kit", city: "Kuala Lumpur", state: "Wilayah Persekutuan", postcode: "50100", phone: "+60 12-345 6789" },
  { name: "Amir Hassan", line1: "B-8-3, Vista Alam", line2: "Shah Alam", city: "Shah Alam", state: "Selangor", postcode: "40150", phone: "+60 12-345 6789" },
];

interface CheckoutScreenProps {
  cartItems: CartItem[];
  onBack: () => void;
  onPlaceOrder: (address: OrderAddress, paymentMethod: string) => void;
}

export function CheckoutScreen({ cartItems, onBack, onPlaceOrder }: CheckoutScreenProps) {
  const [selectedAddr, setSelectedAddr] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState<Partial<OrderAddress>>({});
  const [addresses, setAddresses] = useState(savedAddresses);
  const [phone, setPhone] = useState(savedAddresses[0].phone);

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= 100 ? 0 : 10;
  const total = subtotal + deliveryFee;

  const handleAddAddress = () => {
    if (newAddr.name && newAddr.line1 && newAddr.city && newAddr.postcode) {
      const complete: OrderAddress = {
        name: newAddr.name!, line1: newAddr.line1!, line2: newAddr.line2,
        city: newAddr.city!, state: newAddr.state ?? "", postcode: newAddr.postcode!, phone: phone,
      };
      setAddresses((prev) => [...prev, complete]);
      setSelectedAddr(addresses.length);
      setShowAddForm(false);
      setNewAddr({});
    }
  };

  const handleProceed = () => {
    onPlaceOrder(addresses[selectedAddr], "");
  };

  const inputStyle = {
    backgroundColor: "var(--input-background)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
    borderRadius: 12,
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      {/* Left — Address + contact */}
      <div className="flex-1 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--muted)" }}>
            <ArrowLeft size={16} style={{ color: "var(--foreground)" }} />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--foreground)" }}>Checkout</h1>
        </div>

        {/* Progress stepper */}
        <div className="flex items-center gap-2">
          {[["Cart", true], ["Delivery", true], ["Payment", false]].map(([label, done], i) => (
            <div key={String(label)} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: done ? "var(--navy)" : "var(--muted)", color: done ? "var(--lime)" : "var(--muted-foreground)" }}
                >
                  {done ? <Check size={12} /> : i + 1}
                </div>
                <span className="text-sm" style={{ color: done ? "var(--foreground)" : "var(--muted-foreground)", fontWeight: done ? 600 : 400 }}>
                  {String(label)}
                </span>
              </div>
              {i < 2 && <div className="flex-1 h-px mx-1" style={{ backgroundColor: "var(--border)", minWidth: 24 }} />}
            </div>
          ))}
        </div>

        {/* Delivery Address */}
        <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <MapPin size={15} style={{ color: "var(--navy)" }} /> Delivery Address
            </h2>
            <button onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: "rgba(11,31,58,0.06)", color: "var(--navy)" }}>
              <Plus size={12} /> Add New
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {addresses.map((addr, i) => (
              <button
                key={i}
                onClick={() => setSelectedAddr(i)}
                className="flex items-start gap-3 p-4 rounded-xl text-left transition-all"
                style={{
                  border: `2px solid ${selectedAddr === i ? "var(--navy)" : "var(--border)"}`,
                  backgroundColor: selectedAddr === i ? "rgba(11,31,58,0.04)" : "var(--background)",
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ border: `2px solid ${selectedAddr === i ? "var(--navy)" : "var(--border)"}`, backgroundColor: selectedAddr === i ? "var(--navy)" : "transparent" }}
                >
                  {selectedAddr === i && <Check size={10} color="#A7FF3F" />}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{addr.name}</p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                    {addr.city}, {addr.state} {addr.postcode}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Add address form */}
          {showAddForm && (
            <div className="mt-4 p-4 rounded-xl flex flex-col gap-3" style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>New Address</p>
              <div className="grid grid-cols-2 gap-3">
                {[["Full Name", "name"], ["Line 1", "line1"], ["Line 2 (optional)", "line2"], ["City", "city"], ["State", "state"], ["Postcode", "postcode"]] .map(([placeholder, field]) => (
                  <input
                    key={field}
                    placeholder={placeholder}
                    className="px-3 py-2.5 text-sm outline-none"
                    style={inputStyle}
                    value={(newAddr as Record<string, string>)[field] ?? ""}
                    onChange={(e) => setNewAddr((prev) => ({ ...prev, [field]: e.target.value }))}
                  />
                ))}
              </div>
              <button onClick={handleAddAddress} className="py-2.5 rounded-xl text-sm font-bold" style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}>
                Save Address
              </button>
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <Phone size={15} style={{ color: "var(--navy)" }} /> Contact Number
          </h2>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+60 12-345 6789"
            className="w-full px-4 py-3 text-sm outline-none rounded-xl"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Order Summary */}
      <div className="w-full lg:w-[340px] lg:flex-shrink-0">
        <div className="p-5 rounded-2xl sticky top-20" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <h2 className="font-bold mb-4" style={{ color: "var(--foreground)", fontSize: 16 }}>Order Summary</h2>

          <div className="flex flex-col gap-3 mb-4">
            {cartItems.map((item) => (
              <div key={`${item.id}-${item.color}`} className="flex gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>{item.name}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>×{item.quantity} · {item.color}</p>
                </div>
                <span className="text-sm font-bold flex-shrink-0" style={{ color: "var(--navy)" }}>RM {(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--border)" }} className="pt-3 flex flex-col gap-2 mb-5">
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
              <span style={{ fontSize: 20, fontWeight: 900, color: "var(--navy)" }}>RM {total.toFixed(0)}</span>
            </div>
          </div>

          <button
            onClick={handleProceed}
            className="w-full py-4 rounded-2xl text-sm font-bold"
            style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}
          >
            Continue to Payment →
          </button>
        </div>
      </div>
    </div>
  );
}
