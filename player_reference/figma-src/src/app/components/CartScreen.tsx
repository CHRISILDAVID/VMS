import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag } from "lucide-react";
import type { CartItem } from "../types/shop";

interface CartScreenProps {
  cartItems: CartItem[];
  onUpdateQty: (id: number, color: string, qty: number) => void;
  onRemove: (id: number, color: string) => void;
  onBack: () => void;
  onCheckout: () => void;
}

export function CartScreen({ cartItems, onUpdateQty, onRemove, onBack, onCheckout }: CartScreenProps) {
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= 100 ? 0 : 10;
  const total = subtotal + deliveryFee;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      {/* Cart Items */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--muted)" }}>
            <ArrowLeft size={16} style={{ color: "var(--foreground)" }} />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--foreground)" }}>
            Shopping Cart
          </h1>
          <span className="text-sm ml-1" style={{ color: "var(--muted-foreground)" }}>({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})</span>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--muted)" }}>
              <ShoppingBag size={32} style={{ color: "var(--muted-foreground)" }} />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg" style={{ color: "var(--foreground)" }}>Your cart is empty</p>
              <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Add some products to get started</p>
            </div>
            <button onClick={onBack} className="px-6 py-3 rounded-xl text-sm font-bold" style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}>
              Browse Shop
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {cartItems.map((item) => (
              <div
                key={`${item.id}-${item.color}`}
                className="flex gap-4 p-4 rounded-2xl"
                style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
              >
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>{item.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        Colour: {item.color}
                        {item.badge && <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: "rgba(11,31,58,0.06)", color: "var(--navy)" }}>{item.badge}</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(item.id, item.color)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-red-50 transition-colors"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQty(item.id, item.color, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold" style={{ color: "var(--foreground)" }}>{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQty(item.id, item.color, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-bold" style={{ color: "var(--navy)", fontSize: 15 }}>RM {(item.price * item.quantity).toFixed(0)}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>RM {item.price} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Promo code */}
            <div className="flex gap-2">
              <div
                className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl"
                style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
              >
                <Tag size={14} style={{ color: "var(--muted-foreground)" }} />
                <input placeholder="Promo code" className="bg-transparent outline-none flex-1 text-sm" style={{ color: "var(--foreground)" }} />
              </div>
              <button className="px-5 py-3 rounded-xl text-sm font-semibold" style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}>
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Summary */}
      {cartItems.length > 0 && (
        <div className="w-full lg:w-[340px] lg:flex-shrink-0">
          <div
            className="p-5 rounded-2xl sticky top-20"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
          >
            <h2 className="font-bold mb-5" style={{ color: "var(--foreground)", fontSize: 16 }}>Order Summary</h2>

            <div className="flex flex-col gap-3 mb-5">
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--muted-foreground)" }}>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span style={{ color: "var(--foreground)", fontWeight: 600 }}>RM {subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--muted-foreground)" }}>Delivery Fee</span>
                <span style={{ color: deliveryFee === 0 ? "var(--win-green)" : "var(--foreground)", fontWeight: 600 }}>
                  {deliveryFee === 0 ? "FREE" : `RM ${deliveryFee}`}
                </span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(167,255,63,0.06)", color: "var(--muted-foreground)" }}>
                  Add RM {(100 - subtotal).toFixed(0)} more for free delivery
                </p>
              )}
              <div className="my-1" style={{ borderTop: "1px solid var(--border)" }} />
              <div className="flex justify-between">
                <span className="font-bold" style={{ color: "var(--foreground)" }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: "var(--navy)" }}>RM {total.toFixed(0)}</span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              className="w-full py-4 rounded-2xl text-sm font-bold"
              style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}
            >
              Proceed to Checkout →
            </button>

            <div className="flex items-center justify-center gap-4 mt-4">
              {["🔒 Secure", "📦 Fast Delivery", "↩️ Easy Returns"].map((t) => (
                <span key={t} className="text-xs" style={{ color: "var(--muted-foreground)" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
