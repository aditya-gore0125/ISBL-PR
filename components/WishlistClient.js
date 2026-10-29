'use client';

import { useState } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { useWishlist } from '@/lib/WishlistContext';
import { useCart } from '@/lib/CartContext';

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export default function WishlistClient() {
  const { items, removeFromWishlist, clearWishlist, hydrated } = useWishlist();
  const { addToCart } = useCart();
  const [addedMap, setAddedMap] = useState({});

  const handleAddToCart = (item) => {
    addToCart(
      {
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.discountPrice ? Number(item.discountPrice) : Number(item.price),
        size: null,
      },
      1
    );
    setAddedMap((prev) => ({ ...prev, [item.productId]: true }));
    window.setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [item.productId]: false }));
    }, 1400);
  };

  if (!hydrated) {
    return (
      <main className="min-h-[60vh] bg-ivory">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="h-8 w-40 animate-pulse rounded-md bg-gold/15" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 animate-pulse rounded-[1.25rem] bg-white/60" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-[65vh] bg-ivory py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <div className="rounded-[1.6rem] border border-gold/15 bg-white/80 p-8 shadow-soft sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blush/20 text-maroon">
              <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <h1 className="mt-5 font-fraunces text-3xl text-charcoal sm:text-4xl">Your Wishlist is Empty</h1>
            <p className="mt-3 text-sm leading-6 text-charcoal/70 sm:text-base">
              Explore our handcrafted jewelry collections and click the heart icon on any piece to save it for later.
            </p>
            <div className="mt-8">
              <Link
                href="/collections"
                className="inline-flex min-h-11 items-center justify-center rounded-[0.95rem] bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Saved Items</p>
            <h1 className="mt-2 font-fraunces text-3xl text-charcoal sm:text-4xl">My Wishlist</h1>
            <p className="mt-1 text-sm text-charcoal/70">
              {items.length} {items.length === 1 ? 'piece' : 'pieces'} saved in your personal collection
            </p>
          </div>
          {items.length > 1 ? (
            <button
              type="button"
              onClick={clearWishlist}
              className="inline-flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/60 transition hover:text-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              Clear all items
            </button>
          ) : null}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const hasDiscount = Number(item.discountPrice) > 0 && Number(item.discountPrice) < Number(item.price);
            const currentPrice = hasDiscount ? Number(item.discountPrice) : Number(item.price);
            const isAdded = Boolean(addedMap[item.productId]);

            return (
              <article
                key={item.productId}
                className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-gold/15 bg-white/80 shadow-soft transition duration-300 hover:-translate-y-1"
              >
                <div className="image-shimmer relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-blush/30 via-ivory to-gold/10">
                  <Link href={`/product/${item.slug}`} className="block h-full">
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      width={900}
                      height={1125}
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </Link>
                  {hasDiscount ? (
                    <span className="absolute left-3 top-3 rounded-full bg-maroon px-3 py-1 text-xs font-semibold uppercase text-white">
                      Sale
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.productId)}
                    className="absolute right-2 top-2 z-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-gold/20 bg-white/85 text-maroon shadow-sm backdrop-blur-xs transition hover:border-gold hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    aria-label={`Remove ${item.name} from wishlist`}
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <h2 className="font-fraunces text-lg text-charcoal">
                      <Link href={`/product/${item.slug}`} className="inline-flex min-h-11 items-center transition hover:text-gold-dark">
                        {item.name}
                      </Link>
                    </h2>
                    <div className="mt-2 flex items-center gap-2">
                      {hasDiscount ? (
                        <>
                          <span className="text-sm text-charcoal/60 line-through">{formatCurrency(item.price)}</span>
                          <span className="font-fraunces text-lg text-maroon">{formatCurrency(currentPrice)}</span>
                        </>
                      ) : (
                        <span className="font-fraunces text-lg text-charcoal">{formatCurrency(currentPrice)}</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-gold/20 bg-gold px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      aria-live="polite"
                    >
                      {isAdded ? 'Added ✓' : 'Add to Cart'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item.productId)}
                      className="inline-flex min-h-11 w-full items-center justify-center text-xs font-semibold text-charcoal/60 transition hover:text-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      Remove from Wishlist
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}

