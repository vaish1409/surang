import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("surang_cart") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("surang_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (artwork) => {
    setCartItems(prev => {
      if (prev.find(i => i._id === artwork._id)) return prev;
      return [...prev, { ...artwork, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => setCartItems(prev => prev.filter(i => i._id !== id));

  const clearCart = () => setCartItems([]);

  const isInCart = (id) => cartItems.some(i => i._id === id);

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, isInCart, cartTotal, cartCount: cartItems.length }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() { return useContext(CartContext); }
export default CartContext;
