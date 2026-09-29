'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export default function ProductPurchasePanel({ productId, name, price, discountPrice, image, stock }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const availableStock = Math.max(0, Number(stock) || 0);
  const maxQuantity = Math.min(availableStock, 10);
  const hasDiscount = Number(discountPrice) > 0 && Number(discountPrice) < Number(price);
  const currentPrice = hasDiscount ? Number(discountPrice) : Number(price);
  const cartProduct = { productId: String(productId), name, image, price: currentPrice };

  const addCurrentQuantity = () => {
    if (availableStock <= 0) return;
    addToCart(cartProduct, quantity);
  };

  const handleAddToCart = () => {
    addCurrentQuantity();
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  const handleBuyNow = () => {
    if (availableStock <= 0) return;
    addCurrentQuantity();
    router.push('/checkout');
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {hasDiscount ? <p className="text-sm text-charcoal/60 line-through">{formatCurrency(price)}</p> : null}
          <p className="font-fraunces text-2xl text-charcoal">{formatCurrency(currentPrice)}</p>
        </div>
        <div className="flex items-center rounded-[0.95rem] border border-gold/20 bg-white/70 px-3 py-2">
          <span className="mr-3 text-sm font-semibold text-charcoal">Qty</span>
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={availableStock <= 0 || quantity <= 1}
            className="h-8 w-8 rounded-full text-lg font-semibold text-charcoal transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-9 text-center text-sm font-semibold text-charcoal" aria-live="polite">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
            disabled={availableStock <= 0 || quantity >= maxQuantity}
            className="h-8 w-8 rounded-full text-lg font-semibold text-charcoal transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={availableStock <= 0}
          className="flex-1 rounded-[0.95rem] bg-gold px-5 py-3 text-sm font-semibold uppercase text-white transition hover:bg-gold-dark disabled:cursor-not-allowed disabled:bg-charcoal/30"
          aria-live="polite"
        >
          {availableStock <= 0 ? 'Out of stock' : added ? 'Added ✓' : 'Add to Cart'}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={availableStock <= 0}
          className="flex-1 rounded-[0.95rem] border border-gold/20 bg-white px-5 py-3 text-sm font-semibold uppercase text-charcoal transition hover:border-gold hover:text-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}