import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing        from "./pages/Landing";
import Explore        from "./pages/Explore";
import CulturalMap    from "./pages/CulturalMap";
import ArtDetail      from "./pages/ArtDetail";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import Cart           from "./pages/Cart";
import OrderSuccess   from "./pages/OrderSuccess";
import ArtistDashboard from "./pages/artist/Dashboard";
import UploadArt      from "./pages/artist/UploadArt";
import AdminLogin     from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: "#1C1535", color: "#FFF8F0", border: "1px solid #2E2650" },
              success: { iconTheme: { primary: "#1ABC9C", secondary: "#1C1535" } },
              error:   { iconTheme: { primary: "#C1272D", secondary: "#1C1535" } },
            }}
          />
          <Routes>
            <Route path="/"         element={<Landing />} />
            <Route path="/explore"  element={<Explore />} />
            <Route path="/cultural-map" element={<CulturalMap />} />
            <Route path="/art/:id"  element={<ArtDetail />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart"     element={<Cart />} />
            <Route path="/order-success/:id" element={<OrderSuccess />} />
            <Route path="/artist/dashboard" element={<ProtectedRoute role="artist"><ArtistDashboard /></ProtectedRoute>} />
            <Route path="/artist/upload"    element={<ProtectedRoute role="artist"><UploadArt /></ProtectedRoute>} />
            {/* Admin — secret URL, never linked in navbar */}
            <Route path="/admin/login"      element={<AdminLogin />} />
            <Route path="/admin/dashboard"  element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
