'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'nandini-cart';

const initialState = {
  items: [],
};

function computeTotals(items) {
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { cartCount, cartTotal };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(initialState.items);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed.map((item) => ({ ...item, size: item.size ?? null })));
        }
      }
    } catch (error) {
      console.error('Failed to parse cart from localStorage', error);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const addToCart = (product, quantity = 1) => {
    const quantityToAdd = Math.max(1, Math.min(10, Math.floor(Number(quantity) || 1)));
    const normalizedProduct = { ...product, size: product.size ?? null };
    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex((item) =>
        item.productId === normalizedProduct.productId && (item.size ?? null) === normalizedProduct.size
      );
      if (existingIndex >= 0) {
        return currentItems.map((item, index) =>
          index === existingIndex
            ? { ...item, ...normalizedProduct, quantity: Math.min(10, item.quantity + quantityToAdd) }
            : item
        );
      }
      return [...currentItems, { ...normalizedProduct, quantity: quantityToAdd }];
    });
  };

  const removeFromCart = (productId, size = null) => {
    setItems((currentItems) => currentItems.filter((item) =>
      !(item.productId === productId && (item.size ?? null) === size)
    ));
  };

  const updateQuantity = (productId, size, quantity) => {
    if (typeof size === 'number') {
      quantity = size;
      size = null;
    }
    const safeQuantity = Math.max(1, Math.min(10, Math.floor(Number(quantity) || 1)));
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId && (item.size ?? null) === size ? { ...item, quantity: safeQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const { cartCount, cartTotal } = useMemo(() => computeTotals(items), [items]);

  const value = {
    items,
    cartCount,
    cartTotal,
    hydrated,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
