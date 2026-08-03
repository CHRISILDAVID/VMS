/* MARKER-MAKE-KIT-INVOKED */
import { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { Sidebar } from "./components/Sidebar";
import { BottomNav } from "./components/BottomNav";
import { TopBar } from "./components/TopBar";
import { HomeDashboard } from "./components/HomeDashboard";
import { PlayScreen } from "./components/PlayScreen";
import { TournamentsScreen } from "./components/TournamentsScreen";
import { RankingsScreen } from "./components/RankingsScreen";
import { ShopScreen } from "./components/ShopScreen";
import { CartScreen } from "./components/CartScreen";
import { CheckoutScreen } from "./components/CheckoutScreen";
import { PaymentScreen } from "./components/PaymentScreen";
import { PlayerProfile } from "./components/PlayerProfile";
import { PlayerIDRegistration } from "./components/PlayerIDRegistration";
import { TournamentRegFlow, type TournamentForReg } from "./components/TournamentRegFlow";
import type { CartItem, Order, OrderAddress } from "./types/shop";

type Screen = "home" | "play" | "tournaments" | "rankings" | "shop" | "profile";
type ShopView = "shop" | "cart" | "checkout" | "payment";

function makeOrderId() {
  return `SH${Date.now().toString().slice(-8)}`;
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [screen, setScreen] = useState<Screen>("home");
  const [profileFrom, setProfileFrom] = useState<Screen>("home");

  // Shopping state
  const [shopView, setShopView] = useState<ShopView>("shop");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutAddress, setCheckoutAddress] = useState<OrderAddress | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Profile sub-view
  const [showOrders, setShowOrders] = useState(false);

  // Player ID registration overlay
  const [showPlayerIdReg, setShowPlayerIdReg] = useState(false);

  // Tournament registration flow
  const [tournamentForReg, setTournamentForReg] = useState<TournamentForReg | null>(null);

  const handleLogin = (phone: string) => { setUserPhone(phone); setLoggedIn(true); };
  const handleNav = (id: string) => {
    if (id === "playerid") { setShowPlayerIdReg(true); return; }
    setScreen(id as Screen);
    if (id !== "shop") setShopView("shop");
    if (id !== "profile") setShowOrders(false);
  };

  /* Cart mutations */
  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.id === item.id && i.color === item.color);
      if (exists) return prev.map((i) => i.id === item.id && i.color === item.color ? { ...i, quantity: i.quantity + item.quantity } : i);
      return [...prev, item];
    });
  };
  const updateQty = (id: number, color: string, qty: number) => {
    if (qty <= 0) setCartItems((prev) => prev.filter((i) => !(i.id === id && i.color === color)));
    else setCartItems((prev) => prev.map((i) => i.id === id && i.color === color ? { ...i, quantity: qty } : i));
  };
  const removeItem = (id: number, color: string) => {
    setCartItems((prev) => prev.filter((i) => !(i.id === id && i.color === color)));
  };

  /* Order placement */
  const handlePlaceOrder = (address: OrderAddress) => {
    setCheckoutAddress(address);
    setShopView("payment");
  };
  const handlePaymentSuccess = (paymentMethod: string) => {
    const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const deliveryFee = subtotal >= 100 ? 0 : 10;
    const newOrder: Order = {
      id: makeOrderId(),
      date: new Date().toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }),
      items: [...cartItems],
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      status: "Processing",
      address: checkoutAddress!,
      paymentMethod,
    };
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setShopView("shop");
    // Navigate to profile orders after a short delay
    setTimeout(() => { setScreen("profile"); setShowOrders(true); }, 400);
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => addToCart(item));
    setScreen("shop");
    setShopView("cart");
    setShowOrders(false);
  };

  if (!loggedIn) return <LoginScreen onLogin={handleLogin} />;

  const renderContent = () => {
    // Shopping sub-flow
    if (screen === "shop") {
      if (shopView === "cart") return (
        <CartScreen
          cartItems={cartItems}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onBack={() => setShopView("shop")}
          onCheckout={() => setShopView("checkout")}
        />
      );
      if (shopView === "checkout") return (
        <CheckoutScreen
          cartItems={cartItems}
          onBack={() => setShopView("cart")}
          onPlaceOrder={handlePlaceOrder}
        />
      );
      if (shopView === "payment" && checkoutAddress) return (
        <PaymentScreen
          cartItems={cartItems}
          address={checkoutAddress}
          onBack={() => setShopView("checkout")}
          onSuccess={handlePaymentSuccess}
          onFail={() => {}}
        />
      );
      return (
        <ShopScreen
          cartItems={cartItems}
          onAddToCart={addToCart}
          onGoToCart={() => setShopView("cart")}
          onBuyNow={(item) => { addToCart(item); setShopView("checkout"); }}
        />
      );
    }

    switch (screen) {
      case "home": return <HomeDashboard onNav={handleNav} />;
      case "play": return <PlayScreen onNav={handleNav} />;
      case "rankings": return <RankingsScreen onRegisterPlayerId={() => setShowPlayerIdReg(true)} />;
      case "tournaments": return <TournamentsScreen onRegister={(t) => setTournamentForReg(t)} />;
      case "profile": return (
        <PlayerProfile
          onBack={() => setScreen(profileFrom)}
          phone={userPhone}
          orders={orders}
          showOrders={showOrders}
          onShowOrders={() => setShowOrders(true)}
          onHideOrders={() => setShowOrders(false)}
          onReorder={handleReorder}
        />
      );
    }
  };

  return (
    <div className="flex" style={{ minHeight: "100vh", backgroundColor: "var(--background)", fontFamily: "'Inter', sans-serif" }}>
      {/* Player ID Registration — full-screen overlay */}
      {showPlayerIdReg && (
        <PlayerIDRegistration
          onBack={() => setShowPlayerIdReg(false)}
          onViewRankings={() => { setShowPlayerIdReg(false); setScreen("rankings"); }}
          onGoHome={() => { setShowPlayerIdReg(false); setScreen("home"); }}
        />
      )}

      {/* Tournament Registration Flow — full-screen overlay */}
      {tournamentForReg && (
        <TournamentRegFlow
          tournament={tournamentForReg}
          onClose={() => setTournamentForReg(null)}
          onGoToTournaments={() => { setTournamentForReg(null); setScreen("tournaments"); }}
        />
      )}

      {/* Hide sidebar + bottom nav whenever any full-screen overlay is active */}
      <div className={showPlayerIdReg || !!tournamentForReg ? "hidden" : "contents"}>
      <Sidebar active={screen} onNav={handleNav} />

      <div className="flex flex-col min-w-0 flex-1" style={{ marginLeft: 0 }}>
        <style>{`@media (min-width: 1024px) { .main-shift { margin-left: 240px; } }`}</style>
        <div className="main-shift flex flex-col flex-1 min-h-screen">
          <TopBar onNav={handleNav} />
          <main className="flex-1 overflow-auto pb-24 lg:pb-0">
            {renderContent()}
          </main>
        </div>
      </div>

      <div className="lg:hidden">
        <BottomNav active={screen} onNav={handleNav} />
      </div>
      </div>{/* end showPlayerIdReg hidden wrapper */}
    </div>
  );
}
