'use client';

import { useState } from 'react';
import { useCart } from '@/lib/CartContext';
import Link from 'next/link';

export default function AddToCartButton({ productId, slug, name, image, price, stock, sizes = [] }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = Number(stock) <= 0;

  if (sizes.length) {
    if (outOfStock) {
      return <span className="inline-flex min-h-11 items-center rounded-full border border-gold/20 bg-charcoal/30 px-3 py-2 text-sm font-semibold text-white">Out of Stock</span>;
    }
    return (
      <Link href={`/product/${slug}`} className="inline-flex min-h-11 items-center rounded-full border border-gold/20 bg-gold px-3 py-2 text-sm font-semibold text-white transition hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
        Select Size
      </Link>
    );
  }

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