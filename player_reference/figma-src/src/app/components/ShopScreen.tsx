import { useState } from "react";
import {
  ShoppingCart, Star, Heart, ChevronRight, Package, Zap,
  Search, ChevronLeft, Check, Minus, Plus, Shield, RefreshCw,
} from "lucide-react";
import type { CartItem } from "../types/shop";

/* ─── Product Data ─── */
const products = [
  {
    id: 1, name: "Yonex Astrox 100 ZZ", category: "rackets", price: 289, originalPrice: 349,
    rating: 4.9, reviews: 847, badge: "Best Seller", badgeColor: "#F59E0B",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=500&fit=crop&auto=format",
    inStock: true, tags: ["4U", "G5", "Offensive"],
    colors: [{ name: "Black/Gold", hex: "#1a1a1a" }, { name: "Navy/Red", hex: "#0B1F3A" }, { name: "White/Blue", hex: "#e8eaf6" }],
    description: "The Yonex Astrox 100 ZZ is the pinnacle of offensive badminton technology. Engineered for professional players who demand explosive smash power without sacrificing control. The Rotational Generator System and NANOGY 98 string compatibility make it a favourite on the BWF circuit.",
    specifications: [
      ["Flex", "Extra Stiff"], ["Frame", "HM Graphite / Tungsten"], ["Shaft", "HM Graphite"],
      ["Weight", "4U (80–84g)"], ["Grip Size", "G5"], ["String Tension", "Up to 35 lbs"],
      ["Balance", "Head Heavy"], ["Length", "675 mm"],
    ],
    reviewList: [
      { user: "Lee K.", rating: 5, date: "Aug 3, 2025", comment: "Absolutely phenomenal racket. The smash power is unreal — my opponents can't believe how fast the shuttle travels. Worth every ringgit." },
      { user: "Sarah T.", rating: 5, date: "Jul 29, 2025", comment: "Upgraded from the 88D and the difference is immediately noticeable. Stiffer shaft gives so much more control at higher tensions." },
      { user: "Raj P.", rating: 4, date: "Jul 15, 2025", comment: "Great racket but takes some getting used to if you're coming from a balanced frame. Once you adapt, the power is insane." },
    ],
  },
  {
    id: 2, name: "Li-Ning Aeronaut 9000B", category: "rackets", price: 215, originalPrice: null,
    rating: 4.7, reviews: 412, badge: "New", badgeColor: "#3B82F6",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop&auto=format",
    inStock: true, tags: ["5U", "G6", "All-Round"],
    colors: [{ name: "Blue/Silver", hex: "#3B82F6" }, { name: "Red/Black", hex: "#EF4444" }],
    description: "The Li-Ning Aeronaut 9000B is designed for all-round players who need the perfect balance of speed, control and power. Used by top-ranked doubles specialists on the international circuit.",
    specifications: [
      ["Flex", "Stiff"], ["Frame", "High Modulus Carbon Fiber"], ["Shaft", "High Carbon Fiber"],
      ["Weight", "5U (75–79.9g)"], ["Grip Size", "G6"], ["String Tension", "Up to 30 lbs"],
      ["Balance", "Even Balance"], ["Length", "675 mm"],
    ],
    reviewList: [
      { user: "Wei M.", rating: 5, date: "Aug 5, 2025", comment: "Perfect for doubles. Very responsive and easy to manoeuvre at the net. Highly recommended." },
      { user: "Priya S.", rating: 4, date: "Jul 20, 2025", comment: "Nice all-round frame. Not as powerful as Yonex but the control and feel are excellent." },
    ],
  },
  {
    id: 3, name: "Victor SH-A960 Court Shoes", category: "shoes", price: 149, originalPrice: 189,
    rating: 4.8, reviews: 623, badge: "Sale", badgeColor: "#EF4444",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop&auto=format",
    inStock: true, tags: ["Wide Fit", "Non-Marking"],
    colors: [{ name: "White/Blue", hex: "#e8f4fd" }, { name: "Black/Red", hex: "#1a1a1a" }],
    description: "The Victor SH-A960 delivers professional-grade court performance with its ERG 3.0 technology and reinforced toe box. Ideal for aggressive court coverage and explosive lateral movements.",
    specifications: [
      ["Upper", "Synthetic + Mesh"], ["Midsole", "EVA + TPU Shank"], ["Outsole", "Non-marking rubber"],
      ["Width", "Wide (2E)"], ["Sizes", "UK 5–12"], ["Weight", "310g (UK8)"],
    ],
    reviewList: [
      { user: "Ahmad Z.", rating: 5, date: "Aug 1, 2025", comment: "Best court shoes I've owned. My knee pain is gone after switching to these. The cushioning is exceptional." },
    ],
  },
  {
    id: 4, name: "Yonex Aerosensa 50 (12-pack)", category: "shuttlecocks", price: 48, originalPrice: null,
    rating: 4.6, reviews: 1204, badge: "Pro Choice", badgeColor: "#10B981",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&h=500&fit=crop&auto=format",
    inStock: true, tags: ["Feather", "Speed 77", "Tournament"],
    colors: [{ name: "White", hex: "#f5f5f5" }],
    description: "The tournament-grade choice of BWF sanctioned events worldwide. Made from premium Asiatic goose feathers for consistent flight trajectory and durability across multiple games.",
    specifications: [
      ["Material", "Goose Feather"], ["Speed", "77 (Medium)"], ["Base", "Cork"],
      ["Quantity", "12 per tube"], ["Level", "Tournament Grade"], ["Certification", "BWF Approved"],
    ],
    reviewList: [
      { user: "Marcus T.", rating: 5, date: "Jul 28, 2025", comment: "Used these in our state championship. Consistent flight throughout — even after hard smashes. The standard is excellent." },
      { user: "Chen L.", rating: 4, date: "Jul 10, 2025", comment: "Great shuttles. Last about 2–3 games of competitive play which is expected at this quality level." },
    ],
  },
  {
    id: 5, name: "ShuttleHub Pro Jersey — Navy/Lime", category: "jerseys", price: 65, originalPrice: null,
    rating: 4.5, reviews: 89, badge: "Exclusive", badgeColor: "#0B1F3A",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format",
    inStock: true, tags: ["Breathable", "Official"],
    colors: [{ name: "Navy/Lime", hex: "#0B1F3A" }, { name: "White/Navy", hex: "#ffffff" }, { name: "Black/Lime", hex: "#111827" }],
    description: "The official ShuttleHub Pro Jersey crafted from moisture-wicking Performance Mesh. Designed for competitive players who want to represent with style and stay cool under pressure.",
    specifications: [
      ["Material", "92% Polyester, 8% Spandex"], ["Technology", "DryFit+"], ["Fit", "Athletic Slim"],
      ["Sizes", "XS – 3XL"], ["Care", "Machine Wash Cold"], ["Origin", "Malaysia"],
    ],
    reviewList: [
      { user: "Lim H.", rating: 5, date: "Aug 6, 2025", comment: "Love the navy/lime colourway — looks exactly like the product photos. Very comfortable during long sessions." },
    ],
  },
  {
    id: 6, name: "Yonex Pro Backpack BA92029", category: "bags", price: 119, originalPrice: 149,
    rating: 4.7, reviews: 234, badge: "Popular", badgeColor: "#6B7280",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&auto=format",
    inStock: false, tags: ["2-Racket", "Thermal Pocket"],
    colors: [{ name: "Black", hex: "#1a1a1a" }, { name: "Navy", hex: "#0B1F3A" }],
    description: "The Yonex Pro Backpack fits 2 rackets and features an insulated thermal pocket to protect strings from temperature extremes. Multiple compartments for organised gear storage.",
    specifications: [
      ["Capacity", "28L"], ["Racket Slots", "2"], ["Dimensions", "50 × 30 × 18 cm"],
      ["Material", "1680D Nylon"], ["Laptop Sleeve", "Up to 15\""], ["Weight", "680g"],
    ],
    reviewList: [
      { user: "Siti A.", rating: 5, date: "Jul 25, 2025", comment: "Exactly what I needed for tournaments. Fits everything including laptop and two racket bags. Very sturdy." },
    ],
  },
  {
    id: 7, name: "Victor Overgrip (12-pack)", category: "accessories", price: 18, originalPrice: null,
    rating: 4.4, reviews: 567, badge: null, badgeColor: null,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format",
    inStock: true, tags: ["Tacky", "Thin"],
    colors: [{ name: "White", hex: "#f5f5f5" }, { name: "Black", hex: "#1a1a1a" }, { name: "Blue", hex: "#3B82F6" }],
    description: "Premium tacky overgrip for maximum feel and sweat absorption. Used by professional players seeking consistent grip performance across extended match play.",
    specifications: [
      ["Thickness", "0.6mm"], ["Material", "PU + Cotton"], ["Length", "1100mm"],
      ["Width", "25mm"], ["Quantity", "12 per pack"], ["Grip Feel", "Tacky"],
    ],
    reviewList: [
      { user: "Raj K.", rating: 4, date: "Aug 4, 2025", comment: "Great value pack. Tacky feel lasts about a week of regular play before needing replacement." },
    ],
  },
  {
    id: 8, name: "Apacs Feather Wrist Support", category: "accessories", price: 24, originalPrice: null,
    rating: 4.3, reviews: 156, badge: null, badgeColor: null,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop&auto=format",
    inStock: true, tags: ["Left/Right"],
    colors: [{ name: "Black", hex: "#1a1a1a" }, { name: "Navy", hex: "#0B1F3A" }],
    description: "Compression wrist support designed specifically for badminton athletes. Provides targeted joint support during overhead strokes and lateral wrist movements.",
    specifications: [
      ["Material", "Neoprene + Nylon"], ["Sizes", "S / M / L / XL"], ["Support Level", "Medium"],
      ["Usage", "Left or Right hand"], ["Wash", "Hand wash only"],
    ],
    reviewList: [
      { user: "Wei T.", rating: 4, date: "Jul 22, 2025", comment: "Good compression support. Helped with my wrist pain during smash practice sessions." },
    ],
  },
];

const categories = [
  { id: "all", label: "All" }, { id: "rackets", label: "Rackets" }, { id: "shoes", label: "Shoes" },
  { id: "shuttlecocks", label: "Shuttlecocks" }, { id: "jerseys", label: "Jerseys" },
  { id: "bags", label: "Bags" }, { id: "accessories", label: "Accessories" },
];

/* ─── Star helper ─── */
function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} fill={s <= Math.round(rating) ? "#F59E0B" : "transparent"} stroke="#F59E0B" />
      ))}
    </div>
  );
}

/* ─── Props ─── */
interface ShopScreenProps {
  cartItems: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onGoToCart: () => void;
  onBuyNow: (item: CartItem) => void;
}

export function ShopScreen({ cartItems, onAddToCart, onGoToCart, onBuyNow }: ShopScreenProps) {
  const [activeCat, setActiveCat] = useState("all");
  const [wishlist, setWishlist] = useState<number[]>([1, 4]);
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [addedId, setAddedId] = useState<number | null>(null);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const filtered = activeCat === "all" ? products : products.filter((p) => p.category === activeCat);
  const related = selectedProduct
    ? products.filter((p) => p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0, 3)
    : [];

  const toggleWishlist = (id: number) =>
    setWishlist((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const handleAddToCart = (product: typeof products[0]) => {
    onAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice ?? undefined,
      quantity,
      image: product.image,
      color: product.colors[selectedColor]?.name ?? "Default",
      badge: product.badge,
      category: product.category,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  /* ─── Product Detail View ─── */
  if (selectedProduct) {
    const p = selectedProduct;
    return (
    <div className="flex flex-col" style={{ backgroundColor: "var(--background)", minHeight: "100vh", paddingBottom: 140 }}>
        {/* Top nav */}
        <div
          className="flex items-center justify-between px-4 lg:px-6 py-3 sticky top-0 z-30"
          style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}
        >
          <button
            onClick={() => { setSelectedProduct(null); setSelectedColor(0); setQuantity(1); setActiveTab("desc"); }}
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            <ChevronLeft size={16} /> Back to Shop
          </button>

          <div className="flex items-center gap-2">
            {/* Wishlist count */}
            <button
              onClick={() => toggleWishlist(p.id)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm"
              style={{ backgroundColor: wishlist.includes(p.id) ? "rgba(239,68,68,0.08)" : "var(--muted)", color: wishlist.includes(p.id) ? "#EF4444" : "var(--muted-foreground)", border: `1px solid ${wishlist.includes(p.id) ? "rgba(239,68,68,0.25)" : "var(--border)"}` }}
            >
              <Heart size={15} fill={wishlist.includes(p.id) ? "#EF4444" : "none"} stroke="currentColor" />
              <span className="font-semibold">{wishlist.length}</span>
            </button>

            {/* Cart count */}
            <button
              onClick={onGoToCart}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "var(--navy)", color: "#fff" }}
            >
              <ShoppingCart size={15} />
              Cart
              {cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: "var(--lime)", color: "var(--navy)" }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
          {/* Left: Images */}
          <div className="w-full lg:w-[420px] lg:flex-shrink-0 flex flex-col gap-4">
            <div
              className="relative w-full rounded-2xl overflow-hidden flex items-center justify-center"
              style={{ aspectRatio: "1", backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
            >
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              {p.badge && (
                <span
                  className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full"
                  style={{ backgroundColor: p.badgeColor ?? "#6B7280", color: "#fff" }}
                >
                  {p.badge}
                </span>
              )}
              <button
                onClick={() => toggleWishlist(p.id)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
              >
                <Heart
                  size={16}
                  fill={wishlist.includes(p.id) ? "#EF4444" : "none"}
                  stroke={wishlist.includes(p.id) ? "#EF4444" : "#9CA3AF"}
                />
              </button>
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex-1 flex flex-col gap-5">
            {/* Name + rating */}
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--foreground)", lineHeight: 1.2 }} className="mb-2">
                {p.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <Stars rating={p.rating} size={14} />
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{p.rating}</span>
                <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>({p.reviews} reviews)</span>
                {p.inStock
                  ? <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "var(--win-green)" }}>In Stock</span>
                  : <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "var(--live-red)" }}>Out of Stock</span>
                }
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span style={{ fontSize: 30, fontWeight: 900, color: "var(--navy)" }}>RM {p.price}</span>
              {p.originalPrice && (
                <>
                  <span className="text-lg line-through" style={{ color: "var(--muted-foreground)" }}>RM {p.originalPrice}</span>
                  <span className="text-sm font-bold px-2 py-0.5 rounded-lg" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "var(--live-red)" }}>
                    {Math.round((1 - p.price / p.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span key={t} className="text-xs px-3 py-1.5 rounded-lg" style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}>{t}</span>
              ))}
            </div>

            {/* Color Variants */}
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                Colour: <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>{p.colors[selectedColor]?.name}</span>
              </p>
              <div className="flex gap-3">
                {p.colors.map((c, i) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(i)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: c.hex,
                      border: selectedColor === i ? "3px solid var(--lime-dark)" : "2px solid var(--border)",
                      boxShadow: selectedColor === i ? "0 0 0 2px white, 0 0 0 4px var(--lime-dark)" : "none",
                    }}
                    title={c.name}
                  >
                    {selectedColor === i && (
                      <Check size={12} style={{ color: c.hex === "#f5f5f5" || c.hex === "#ffffff" || c.hex === "#e8f4fd" || c.hex === "#e8eaf6" ? "#666" : "#fff" }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-bold" style={{ color: "var(--foreground)", fontSize: 16 }}>{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
                >
                  <Plus size={14} />
                </button>
                <span className="text-sm ml-2 font-semibold" style={{ color: "var(--navy)" }}>
                  = RM {(p.price * quantity).toFixed(0)}
                </span>
              </div>
            </div>

            {/* Delivery info */}
            <div
              className="flex items-center gap-3 p-3.5 rounded-xl"
              style={{ backgroundColor: "rgba(167,255,63,0.06)", border: "1px solid rgba(167,255,63,0.2)" }}
            >
              <Package size={16} style={{ color: "var(--lime-dark)" }} className="flex-shrink-0" />
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Free Delivery on orders above RM 100</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Estimated 2–4 business days · COD available</p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex gap-4 flex-wrap">
              {[
                { icon: Shield, label: "1-Year Warranty" },
                { icon: RefreshCw, label: "7-Day Returns" },
                { icon: Package, label: "Authentic Product" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <Icon size={13} style={{ color: "var(--navy)" }} />
                  {label}
                </div>
              ))}
            </div>

            {/* Description / Specs / Reviews tabs */}
            <div className="mt-1">
              <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ backgroundColor: "var(--muted)" }}>
                {([["desc", "Description"], ["specs", "Specifications"], ["reviews", "Reviews"]] as const).map(([id, label]) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className="flex-1 py-2 rounded-lg text-sm transition-all"
                    style={{ backgroundColor: activeTab === id ? "var(--navy)" : "transparent", color: activeTab === id ? "#fff" : "var(--muted-foreground)", fontWeight: activeTab === id ? 600 : 400 }}>
                    {label}{id === "reviews" ? ` (${p.reviewList.length})` : ""}
                  </button>
                ))}
              </div>

              {/* Description */}
              {activeTab === "desc" && (
                <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{p.description}</p>
              )}

              {/* Specifications */}
              {activeTab === "specs" && (
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  {p.specifications.map(([k, v], i) => (
                    <div
                      key={k}
                      className="flex px-4 py-3"
                      style={{ backgroundColor: i % 2 === 0 ? "var(--card)" : "var(--background)", borderBottom: i < p.specifications.length - 1 ? "1px solid var(--border)" : "none" }}
                    >
                      <span className="flex-1 text-sm" style={{ color: "var(--muted-foreground)", fontWeight: 500 }}>{k}</span>
                      <span className="flex-1 text-sm font-semibold" style={{ color: "var(--foreground)" }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Reviews */}
              {activeTab === "reviews" && (
                <div className="flex flex-col gap-4">
                  {/* Rating summary */}
                  <div
                    className="flex items-center gap-6 p-4 rounded-2xl"
                    style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                  >
                    <div className="text-center">
                      <p style={{ fontSize: 40, fontWeight: 900, color: "var(--navy)" }}>{p.rating}</p>
                      <Stars rating={p.rating} size={16} />
                      <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{p.reviews} reviews</p>
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const pct = star === 5 ? 72 : star === 4 ? 18 : star === 3 ? 6 : star === 2 ? 2 : 2;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs w-3" style={{ color: "var(--muted-foreground)" }}>{star}</span>
                            <Star size={10} fill="#F59E0B" stroke="#F59E0B" />
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#F59E0B" }} />
                            </div>
                            <span className="text-xs w-7" style={{ color: "var(--muted-foreground)" }}>{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review cards */}
                  {p.reviewList.map((r, i) => (
                    <div key={i} className="p-4 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "var(--navy)", color: "var(--lime)" }}>
                            {r.user.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{r.user}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stars rating={r.rating} size={12} />
                          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{r.date}</span>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Related Products */}
            {related.length > 0 && (
              <div className="mt-2">
                <h3 className="text-sm font-bold mb-3" style={{ color: "var(--foreground)" }}>Related Products</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {related.map((rp) => (
                    <button
                      key={rp.id}
                      onClick={() => { setSelectedProduct(rp); setSelectedColor(0); setQuantity(1); setActiveTab("desc"); window.scrollTo(0, 0); }}
                      className="rounded-2xl overflow-hidden text-left hover:scale-[1.02] transition-all"
                      style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                    >
                      <img src={rp.image} alt={rp.name} className="w-full object-cover" style={{ height: 100 }} />
                      <div className="p-2.5">
                        <p className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }}>{rp.name}</p>
                        <p className="text-xs font-bold mt-0.5" style={{ color: "var(--navy)" }}>RM {rp.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Sticky Bottom Action Bar ── */}
        {/* On mobile, sits above the BottomNav (72px). On desktop, sits at bottom-0. */}
        <div
          className="fixed left-0 right-0 z-40 flex gap-3 px-4 lg:px-6 py-3 bottom-[72px] lg:bottom-0"
          style={{
            backgroundColor: "var(--card)",
            borderTop: "1px solid var(--border)",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
            paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
          }}
        >
          {/* Wishlist */}
          <button
            onClick={() => toggleWishlist(p.id)}
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: wishlist.includes(p.id) ? "rgba(239,68,68,0.08)" : "var(--muted)",
              border: `2px solid ${wishlist.includes(p.id) ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
            }}
          >
            <Heart size={18} fill={wishlist.includes(p.id) ? "#EF4444" : "none"} stroke={wishlist.includes(p.id) ? "#EF4444" : "var(--muted-foreground)"} />
          </button>

          {/* Add to Cart */}
          <button
            onClick={() => { if (p.inStock) handleAddToCart(p); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all"
            style={{
              backgroundColor: addedId === p.id ? "rgba(16,185,129,0.1)" : "var(--muted)",
              color: addedId === p.id ? "var(--win-green)" : "var(--navy)",
              border: `2px solid ${addedId === p.id ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
            }}
          >
            {addedId === p.id ? <><Check size={16} /> Added!</> : <><ShoppingCart size={16} /> Add to Cart</>}
          </button>

          {/* Buy Now — skips Cart, goes directly to Checkout */}
          <button
            onClick={() => {
              if (p.inStock) {
                onBuyNow({
                  id: p.id, name: p.name, price: p.price,
                  originalPrice: p.originalPrice ?? undefined,
                  quantity, image: p.image,
                  color: p.colors[selectedColor]?.name ?? "Default",
                  badge: p.badge, category: p.category,
                });
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold"
            style={{
              backgroundColor: p.inStock ? "var(--navy)" : "var(--muted)",
              color: p.inStock ? "var(--lime)" : "var(--muted-foreground)",
            }}
          >
            {p.inStock ? "Buy Now →" : "Out of Stock"}
          </button>
        </div>
      </div>
    );
  }

  /* ─── List View ─── */
  return (
    <div className="p-4 lg:p-6 flex flex-col gap-5 lg:gap-6" style={{ backgroundColor: "var(--background)", minHeight: "100vh" }}>
      {/* Search bar */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{ backgroundColor: "var(--card)", border: "1.5px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      >
        <Search size={16} style={{ color: "var(--muted-foreground)" }} strokeWidth={2} />
        <input placeholder="Search rackets, shoes, shuttlecocks…" className="bg-transparent outline-none flex-1 text-sm" style={{ color: "var(--foreground)" }} />
      </div>

      {/* Category + Cart */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1 p-1 rounded-2xl overflow-x-auto flex-1" style={{ backgroundColor: "var(--muted)" }}>
          {categories.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveCat(id)}
              className="px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all"
              style={{ backgroundColor: activeCat === id ? "var(--navy)" : "transparent", color: activeCat === id ? "#fff" : "var(--muted-foreground)", fontWeight: activeCat === id ? 600 : 400 }}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={onGoToCart}
          className="relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold flex-shrink-0"
          style={{ backgroundColor: "var(--navy)", color: "#fff" }}
        >
          <ShoppingCart size={16} />
          Cart
          {cartCount > 0 && (
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "var(--lime)", color: "var(--navy)" }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Featured banner */}
      {activeCat === "all" && (
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8 p-5 lg:p-6 rounded-2xl cursor-pointer hover:scale-[1.005] transition-all"
          style={{ background: "linear-gradient(135deg, var(--navy) 0%, #162D52 100%)" }}
          onClick={() => setSelectedProduct(products[0])}
        >
          <img src={products[0].image} alt={products[0].name} className="rounded-2xl object-cover flex-shrink-0" style={{ width: 140, height: 120 }} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} style={{ color: "var(--lime)" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--lime)" }}>Featured Product</span>
            </div>
            <h2 className="text-white mb-1" style={{ fontSize: 20, fontWeight: 700 }}>{products[0].name}</h2>
            <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>Trusted by BWF-level professionals. The #1 offensive racket of 2025.</p>
            <div className="flex items-center gap-4">
              <span style={{ color: "var(--lime)", fontWeight: 800, fontSize: 22 }}>RM {products[0].price}</span>
              <span className="line-through text-base" style={{ color: "rgba(255,255,255,0.35)" }}>RM {products[0].originalPrice}</span>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold ml-4" style={{ backgroundColor: "var(--lime)", color: "var(--navy)" }}>
                Shop Now <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
        {filtered.map((product) => (
          <div
            key={product.id}
            className="rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.01] transition-all"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            onClick={() => setSelectedProduct(product)}
          >
            <div className="relative" style={{ height: 180 }}>
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              <button
                onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
              >
                <Heart size={14} fill={wishlist.includes(product.id) ? "#EF4444" : "none"} stroke={wishlist.includes(product.id) ? "#EF4444" : "#9CA3AF"} />
              </button>
              {product.badge && (
                <span className="absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: product.badgeColor || "#6B7280", color: "#fff" }}>
                  {product.badge}
                </span>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
                  <span className="text-white text-sm font-bold">Out of Stock</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold mb-1 truncate" style={{ color: "var(--foreground)" }}>{product.name}</p>
              <div className="flex items-center gap-1 mb-2">
                <Star size={11} fill="#F59E0B" stroke="#F59E0B" />
                <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{product.rating}</span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>({product.reviews})</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold" style={{ color: "var(--navy)", fontSize: 16 }}>RM {product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xs line-through" style={{ color: "var(--muted-foreground)" }}>RM {product.originalPrice}</span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (product.inStock) {
                      onAddToCart({ id: product.id, name: product.name, price: product.price, originalPrice: product.originalPrice ?? undefined, quantity: 1, image: product.image, color: product.colors[0]?.name ?? "Default", badge: product.badge, category: product.category });
                      setAddedId(product.id);
                      setTimeout(() => setAddedId(null), 2000);
                    }
                  }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                  style={{ backgroundColor: addedId === product.id ? "rgba(16,185,129,0.12)" : product.inStock ? "var(--navy)" : "var(--muted)", color: addedId === product.id ? "var(--win-green)" : product.inStock ? "var(--lime)" : "var(--muted-foreground)" }}
                >
                  {addedId === product.id ? <Check size={14} /> : <ShoppingCart size={14} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
