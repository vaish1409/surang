import React from "react";
import { Link, useParams } from "react-router-dom";

export default function OrderSuccess() {
  const { id } = useParams();
  return (
    <div className="min-h-screen bg-deep flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-7xl mb-6 animate-float inline-block">🎉</div>
        <h1 className="font-display text-4xl text-cream font-bold mb-3">Order Placed!</h1>
        <p className="text-cream-muted text-sm mb-2 leading-relaxed">
          Your order has been confirmed. The artist will pack and ship your artwork directly to you.
        </p>
        <p className="text-saffron text-xs mb-8 font-mono">Order ID: {id}</p>
        <div className="space-y-4 bg-surface-2 border border-surface-3 rounded-2xl p-6 text-sm text-left mb-8">
          {[["Confirmed ✓","Order confirmed & artist notified"],["Packing","Artist packs your artwork with care"],["Shipped","Tracking number sent to you"],["Delivered","Artwork arrives at your doorstep"]].map(([s,d],i)=>(
            <div key={s} className="status-step">
              <div className={`status-dot ${i===0?"done":i===1?"current":"pending"}`}/>
              <div>
                <p className={`font-medium ${i===0?"text-teal":i===1?"text-saffron":"text-cream-muted"}`}>{s}</p>
                <p className="text-cream-muted text-xs">{d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/explore" className="btn-saffron px-6 py-3">Shop More Art</Link>
          <Link to="/"        className="btn-outline px-6 py-3">Go Home</Link>
        </div>
      </div>
    </div>
  );
}
