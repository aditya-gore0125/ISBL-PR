'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { getSizeOptions } from '@/lib/sizeConfig';

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export default function ProductPurchasePanel({ productId, name, price, discountPrice, image, stock, sizes = [], type, category }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const sizeRowRef = useRef(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const sizeOptions = getSizeOptions(type, category);
  const isSized = sizeOptions !== null;
  const sizeStocks = sizeOptions
    ? sizeOptions.map((size) => ({
        size,
        stock: Math.max(0, Number(sizes.find((entry) => entry.size === size)?.stock) || 0),
      }))
    : [];
  const selectedSizeStock = sizeStocks.find((entry) => entry.size === selectedSize)?.stock;
  const availableStock = Math.max(0, Number(isSized ? selectedSizeStock : stock) || 0);
  const maxQuantity = Math.min(availableStock, 10);
  const allSizesOutOfStock = isSized && sizeStocks.every((entry) => entry.stock <= 0);
  const hasDiscount = Number(discountPrice) > 0 && Number(discountPrice) < Number(price);
  const currentPrice = hasDiscount ? Number(discountPrice) : Number(price);
  const cartProduct = { productId: String(productId), size: selectedSize, name, image, price: currentPrice };

  const addCurrentQuantity = () => {
    if (isSized && !selectedSize) {
      setSizeError(true);
      requestAnimationFrame(() => {
        sizeRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        sizeRowRef.current?.focus({ preventScroll: true });
      });
      return false;
    }
    if (availableStock <= 0) return false;
    addToCart(cartProduct, quantity);
    return true;
  };

  const handleAddToCart = () => {
    if (!addCurrentQuantity()) return;
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  const handleBuyNow = () => {
    if (!addCurrentQuantity()) return;
    router.push('/checkout');
  };

  return (
    <div className="mt-8 space-y-4">
      {isSized ? (
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-charcoal">Select Size</p>
            <p className="text-sm font-medium text-charcoal" aria-live="polite">{selectedSize ? `Size: ${selectedSize}` : ''}</p>
          </div>
          <div
            ref={sizeRowRef}
            role="radiogroup"
            aria-label="Select product size"
            tabIndex={-1}
            className="flex flex-wrap gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            {sizeStocks.map((entry) => {
              const soldOut = entry.stock <= 0;
              const selected = selectedSize === entry.size;
              return (
                <button
                  key={entry.size}
                  type="button"
                  disabled={soldOut}
                  onClick={() => {
                    setSelectedSize(entry.size);
                    setQuantity(1);
                    setSizeError(false);
                  }}
                  aria-pressed={selected}
                  className={`relative min-h-11 min-w-11 overflow-hidden rounded-lg border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${soldOut ? 'cursor-not-allowed border-gold/40 bg-ivory text-charcoal opacity-50' : selected ? 'border-gold-dark bg-gold text-white' : 'border-gold/40 bg-ivory text-charcoal hover:border-gold'}`}
                  aria-label={soldOut ? `Size ${entry.size}, sold out` : `Select size ${entry.size}`}
                >
                  <span>{entry.size}</span>
                  {soldOut ? <span aria-hidden="true" className="pointer-events-none absolute inset-x-1/2 top-1/2 h-px w-[calc(100%-0.5rem)] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-maroon" /> : null}
                </button>
              );
            })}
          </div>
          {sizeError ? <p role="alert" className="mt-2 text-sm text-maroon">Please select a size</p> : null}
          {selectedSize && availableStock > 0 ? (
            <p className={`mt-2 text-sm ${availableStock <= 3 ? 'text-maroon' : 'text-charcoal/70'}`}>
              {availableStock <= 3 ? `Only ${availableStock} left` : `${availableStock} in stock`} for size {selectedSize}
            </p>
          ) : null}
          {allSizesOutOfStock ? <p className="mt-2 text-sm font-semibold text-maroon">Out of Stock</p> : null}
          {selectedSize && availableStock > 0 ? <p className="sr-only" aria-live="polite">In stock for size {selectedSize}</p> : null}
        </section>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {hasDiscount ? <p className="text-sm text-charcoal/60 line-through">{formatCurrency(price)}</p> : null}
          <p className="font-fraunces text-2xl text-charcoal">{formatCurrency(currentPrice)}</p>
        </div>
        <div className="flex items-center rounded-[0.95rem] border border-gold/20 bg-white/70 px-3 py-2">
          <span className="mr-3 text-sm font-semibold text-charcoal">
            Qty{isSized && selectedSize ? ` · max ${maxQuantity}` : ''}
          </span>
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
          disabled={isSized ? allSizesOutOfStock : availableStock <= 0}
          className="flex-1 rounded-[0.95rem] bg-gold px-5 py-3 text-sm font-semibold uppercase text-white transition hover:bg-gold-dark disabled:cursor-not-allowed disabled:bg-charcoal/30"
          aria-live="polite"
        >
          {(isSized ? allSizesOutOfStock : availableStock <= 0) ? 'Out of stock' : added ? 'Added ✓' : 'Add to Cart'}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isSized ? allSizesOutOfStock : availableStock <= 0}
          className="flex-1 rounded-[0.95rem] border border-gold/20 bg-white px-5 py-3 text-sm font-semibold uppercase text-charcoal transition hover:border-gold hover:text-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}