'use client';

import { useState } from 'react';
import { useCart } from '@/lib/CartContext';

export default function AddToCartButton({ productId, name, image, price, stock }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = Number(stock) <= 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    addToCart({ productId: String(productId), name, image, price }, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={outOfStock}
      className="min-h-11 rounded-full border border-gold/20 bg-gold px-3 py-2 text-sm font-semibold text-white transition hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:bg-charcoal/30"
      aria-live="polite"
    >
      {outOfStock ? 'Out of stock' : added ? 'Added ✓' : 'Add to Cart'}
    </button>
  );
}