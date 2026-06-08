import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";

const STATES = ["Andhra Pradesh","Bihar","Delhi","Gujarat","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","West Bengal","Other"];

export default function Cart() {
  const { cartItems, removeFromCart, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep]   = useState("cart"); // cart | address | payment
  const [addr, setAddr]   = useState({ name: user?.name||"", phone: user?.phone||"", address:"", city:"", state:"", pincode:"" });
  const [paying, setPaying] = useState(false);

  const handleCheckout = async () => {
    if (!user) { toast.error("Please sign in first"); navigate("/login"); return; }
    setStep("address");
  };

  const handlePay = async () => {
    if (!addr.name||!addr.phone||!addr.address||!addr.city||!addr.state||!addr.pincode) {
      toast.error("Please fill all address fields"); return;
    }
    setPaying(true);
    try {
      const { data: rzpOrder } = await api.post("/orders/razorpay", { amount: cartTotal });
      const options = {
        key:      import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount:   rzpOrder.amount,
        currency: "INR",
        name:     "SURANG",
        description: "Indian Art Purchase",
        order_id: rzpOrder.id,
        handler: async (response) => {
          const items = cartItems.map(i=>({ artwork: i._id, artist: i.artist?._id||i.artist, title:i.title, price:i.price, quantity:i.quantity, image:i.images?.[0]||"" }));
          const { data: order } = await api.post("/orders", {
            items, shippingAddress: addr,
            paymentId: response.razorpay_payment_id,
            orderId:   response.razorpay_order_id,
            totalAmount: cartTotal,
          });
          clearCart();
          toast.success("Order placed! 🎉");
          navigate(`/order-success/${order._id}`);
        },
        prefill: { name: addr.name, contact: addr.phone },
        theme: { color: "#F7941D" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch(e) { toast.error("Payment setup failed. Try again."); }
    finally { setPaying(false); }
  };

  if (cartItems.length === 0) return (
    <div className="min-h-screen bg-deep">
      <Navbar/>
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="text-6xl">🛒</div>
        <h2 className="font-display text-2xl text-cream">Your cart is empty</h2>
        <p className="text-cream-muted text-sm">Discover amazing Indian artworks and add them here</p>
        <Link to="/explore" className="btn-saffron px-8 py-3 mt-2">Explore Art</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-deep">
      <Navbar/>
      {/* Load Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"/>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <h1 className="font-display text-3xl text-cream font-bold mb-2">Your Cart</h1>
        <p className="text-cream-muted text-sm mb-8">{cartItems.length} artwork{cartItems.length > 1 ? "s" : ""}</p>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          {["cart","address","payment"].map((s,i)=>(
            <React.Fragment key={s}>
              <span className={`capitalize font-medium ${step===s?"text-saffron":"text-cream-muted"}`}>{s}</span>
              {i<2 && <span className="text-cream-muted/40">→</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items / Address */}
          <div className="lg:col-span-2 space-y-3">
            {step === "cart" && cartItems.map(item=>(
              <div key={item._id} className="flex gap-4 bg-surface rounded-2xl p-4 border border-surface-3/50">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-2 flex-shrink-0">
                  {item.images?.[0] ? <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-3xl">🎨</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-cream font-medium text-sm leading-tight truncate">{item.title}</h3>
                  <p className="text-cream-muted text-xs mt-0.5">{item.category}</p>
                  <p className="text-saffron font-bold mt-1.5">₹{item.price?.toLocaleString("en-IN")}</p>
                </div>
                <button onClick={()=>removeFromCart(item._id)} className="text-cream-muted hover:text-crimson transition-colors text-sm p-1">✕</button>
              </div>
            ))}

            {step === "address" && (
              <div className="bg-surface-2 border border-surface-3 rounded-2xl p-6 space-y-4">
                <h3 className="text-cream font-semibold">Delivery Address</h3>
                {[["name","Full Name *"],["phone","Phone Number *"],["address","Street Address *"],["city","City *"],["pincode","Pincode *"]].map(([k,label])=>(
                  <div key={k}>
                    <label className="text-cream-muted text-xs mb-1.5 block">{label}</label>
                    <input value={addr[k]} onChange={e=>setAddr(p=>({...p,[k]:e.target.value}))} className="input-dark" placeholder={label.replace(" *","")}/>
                  </div>
                ))}
                <div>
                  <label className="text-cream-muted text-xs mb-1.5 block">State *</label>
                  <select value={addr.state} onChange={e=>setAddr(p=>({...p,state:e.target.value}))} className="input-dark">
                    <option value="">Select state</option>
                    {STATES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-surface-2 border border-surface-3 rounded-2xl p-6 sticky top-24">
              <h3 className="text-cream font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-cream-muted">Subtotal</span><span className="text-cream">₹{cartTotal.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-cream-muted">Platform fee</span><span className="text-teal">₹0 (Free!)</span></div>
                <div className="flex justify-between"><span className="text-cream-muted">Shipping</span><span className="text-cream">Artist managed</span></div>
              </div>
              <div className="border-t border-surface-3 pt-3 flex justify-between items-center mb-5">
                <span className="text-cream font-semibold">Total</span>
                <span className="text-saffron text-xl font-bold">₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>
              {step==="cart" && <button onClick={handleCheckout} className="w-full btn-saffron py-3 text-center font-semibold rounded-xl">Proceed to Address</button>}
              {step==="address" && (
                <div className="space-y-2">
                  <button onClick={handlePay} disabled={paying} className={`w-full btn-saffron py-3 font-semibold rounded-xl ${paying?"opacity-60 cursor-wait":""}`}>
                    {paying?"Processing…":"Pay ₹"+cartTotal.toLocaleString("en-IN")}
                  </button>
                  <button onClick={()=>setStep("cart")} className="w-full text-cream-muted text-sm hover:text-cream transition-colors">← Back to cart</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
