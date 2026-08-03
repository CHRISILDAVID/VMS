import { useState } from "react";
import { Package, ChevronRight, ArrowLeft, MapPin, CreditCard, RefreshCw, Truck } from "lucide-react";
import type { Order } from "../types/shop";

const statusColors: Record<string, { bg: string; text: string }> = {
  Processing: { bg: "rgba(59,130,246,0.1)", text: "#3B82F6" },
  Shipped: { bg: "rgba(245,158,11,0.1)", text: "#F59E0B" },
  Delivered: { bg: "rgba(16,185,129,0.1)", text: "#10B981" },
  Cancelled: { bg: "rgba(239,68,68,0.1)", text: "#EF4444" },
};

const statusTimeline: Record<string, { step: string; done: boolean }[]> = {
  Processing: [
    { step: "Order Placed", done: true },
    { step: "Processing", done: true },
    { step: "Shipped", done: false },
    { step: "Delivered", done: false },
  ],
  Shipped: [
    { step: "Order Placed", done: true },
    { step: "Processing", done: true },
    { step: "Shipped", done: true },
    { step: "Delivered", done: false },
  ],
  Delivered: [
    { step: "Order Placed", done: true },
    { step: "Processing", done: true },
    { step: "Shipped", done: true },
    { step: "Delivered", done: true },
  ],
  Cancelled: [
    { step: "Order Placed", done: true },
    { step: "Cancelled", done: true },
  ],
};

interface OrderHistoryScreenProps {
  orders: Order[];
  onBack: () => void;
  onReorder: (order: Order) => void;
}

export function OrderHistoryScreen({ orders, onBack, onReorder }: OrderHistoryScreenProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  /* ── Order Detail ── */
  if (selectedOrder) {
    const o = selectedOrder;
    const timeline = statusTimeline[o.status] ?? statusTimeline.Processing;

    return (
      <div className="p-4 lg:p-6 flex flex-col gap-5 min-h-screen" style={{ backgroundColor: "var(--background)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedOrder(null)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--muted)" }}>
            <ArrowLeft size={16} style={{ color: "var(--foreground)" }} />
          </button>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)" }}>Order #{o.id}</h1>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{o.date}</p>
          </div>
          <span
            className="ml-auto text-xs font-bold px-3 py-1.5 rounded-xl"
            style={{ backgroundColor: statusColors[o.status]?.bg, color: statusColors[o.status]?.text }}
          >
            {o.status}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1 flex flex-col gap-5">
            {/* Items */}
            <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
              <h2 className="text-sm font-bold mb-4" style={{ color: "var(--foreground)" }}>Items Ordered</h2>
              <div className="flex flex-col gap-3">
                {o.items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{item.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Colour: {item.color} · Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-sm flex-shrink-0" style={{ color: "var(--navy)" }}>RM {(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
              <h2 className="text-sm font-bold mb-4" style={{ color: "var(--foreground)" }}>Price Breakdown</h2>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--muted-foreground)" }}>Subtotal</span>
                  <span style={{ fontWeight: 600, color: "var(--foreground)" }}>RM {o.subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--muted-foreground)" }}>Delivery</span>
                  <span style={{ fontWeight: 600, color: o.deliveryFee === 0 ? "var(--win-green)" : "var(--foreground)" }}>
                    {o.deliveryFee === 0 ? "FREE" : `RM ${o.deliveryFee}`}
                  </span>
                </div>
                <div style={{ borderTop: "1px solid var(--border)" }} className="pt-2 flex justify-between">
                  <span className="font-bold" style={{ color: "var(--foreground)" }}>Total Paid</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "var(--navy)" }}>RM {o.total.toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
              <h2 className="text-sm font-bold mb-5" style={{ color: "var(--foreground)" }}>Order Status</h2>
              <div className="flex flex-col gap-0">
                {timeline.map((step, i) => (
                  <div key={step.step} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: step.done ? "var(--navy)" : "var(--muted)", border: `2px solid ${step.done ? "var(--navy)" : "var(--border)"}` }}
                      >
                        {step.done
                          ? <span className="text-xs text-white">✓</span>
                          : <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{i + 1}</span>
                        }
                      </div>
                      {i < timeline.length - 1 && (
                        <div className="w-0.5 h-8 mt-1" style={{ backgroundColor: step.done ? "var(--navy)" : "var(--border)" }} />
                      )}
                    </div>
                    <div className="pt-1.5 pb-4">
                      <p className="text-sm font-semibold" style={{ color: step.done ? "var(--foreground)" : "var(--muted-foreground)" }}>{step.step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="w-full lg:w-[300px] lg:flex-shrink-0 flex flex-col gap-4">
            {/* Delivery Address */}
            <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
              <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <MapPin size={14} style={{ color: "var(--navy)" }} /> Delivery Address
              </h2>
              <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{o.address.name}</p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                {o.address.line1}{o.address.line2 ? `, ${o.address.line2}` : ""}<br />
                {o.address.city}, {o.address.state} {o.address.postcode}<br />
                {o.address.phone}
              </p>
            </div>

            {/* Payment */}
            <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
              <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <CreditCard size={14} style={{ color: "var(--navy)" }} /> Payment Method
              </h2>
              <p className="text-sm" style={{ color: "var(--foreground)" }}>{o.paymentMethod}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {o.status === "Shipped" && (
                <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold" style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}>
                  <Truck size={15} /> Track Order
                </button>
              )}
              <button
                onClick={() => onReorder(o)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold"
                style={{ backgroundColor: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}
              >
                <RefreshCw size={15} /> Reorder
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Order List ── */
  return (
    <div className="p-4 lg:p-6 flex flex-col gap-5 min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--muted)" }}>
          <ArrowLeft size={16} style={{ color: "var(--foreground)" }} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--foreground)" }}>My Orders</h1>
        <span className="text-sm ml-1" style={{ color: "var(--muted-foreground)" }}>({orders.length} orders)</span>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--muted)" }}>
            <Package size={32} style={{ color: "var(--muted-foreground)" }} />
          </div>
          <div className="text-center">
            <p className="font-bold text-lg" style={{ color: "var(--foreground)" }}>No orders yet</p>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Your order history will appear here</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="flex gap-4 p-4 rounded-2xl text-left hover:scale-[1.005] transition-all"
              style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              {/* First item image */}
              <img
                src={order.items[0]?.image}
                alt={order.items[0]?.name}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>
                      {order.items[0]?.name}
                      {order.items.length > 1 && <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}> +{order.items.length - 1} more</span>}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      Order #{order.id} · {order.date}
                    </p>
                  </div>
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-xl flex-shrink-0"
                    style={{ backgroundColor: statusColors[order.status]?.bg, color: statusColors[order.status]?.text }}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold" style={{ color: "var(--navy)", fontSize: 15 }}>RM {order.total.toFixed(0)}</span>
                  <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
