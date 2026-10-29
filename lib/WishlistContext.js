'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'nandini-wishlist';

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to parse wishlist from localStorage', error);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save wishlist to localStorage', error);
    }
  }, [hydrated, items]);

  const toggleWishlist = useCallback((product) => {
    if (!product) return;
    const rawId = product.productId || product._id;
    if (!rawId) return;
    const productId = String(rawId);

    setItems((currentItems) => {
      const exists = currentItems.some((item) => String(item.productId) === productId);
      if (exists) {
        return currentItems.filter((item) => String(item.productId) !== productId);
      }
      const newItem = {
        productId,
        slug: String(product.slug || ''),
        name: String(product.name || ''),
        image: String(product.image || product.images?.[0] || '/category-placeholder.svg'),
        price: Number(product.price || 0),
        discountPrice: Number(product.discountPrice) > 0 ? Number(product.discountPrice) : null,
      };
      return [...currentItems, newItem];
    });
  }, []);

  const isWishlisted = useCallback((productId) => {
    if (!productId) return false;
    return items.some((item) => String(item.productId) === String(productId));
  }, [items]);

  const removeFromWishlist = useCallback((productId) => {
    if (!productId) return;
    setItems((currentItems) => currentItems.filter((item) => String(item.productId) !== String(productId)));
  }, []);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const wishlistCount = items.length;

  const value = useMemo(
    () => ({
      items,
      wishlistCount,
      hydrated,
      toggleWishlist,
      isWishlisted,
      removeFromWishlist,
      clearWishlist,
    }),
    [items, wishlistCount, hydrated, toggleWishlist, isWishlisted, removeFromWishlist, clearWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
