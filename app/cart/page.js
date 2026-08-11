'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';

function formatPrice(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

export default function CartPage() {
  const router = useRouter();
  const { items, cartTotal, removeFromCart, updateQuantity } = useCart();
  const shipping = cartTotal >= 999 || cartTotal === 0 ? 0 : 99;
  const totalAmount = cartTotal + shipping;

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[1.5rem] border border-gold/15 bg-white/80 p-10 text-center shadow-soft">
          <h1 className="font-fraunces text-3xl text-charcoal">Your cart is empty</h1>
          <p className="mt-4 text-sm leading-7 text-charcoal/75">Add a few beautiful pieces and return here when you’re ready to check out.</p>
          <Link href="/" className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-semibold text-white transition hover:bg-gold-dark">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded-[1.5rem] border border-gold/15 bg-white/80 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-fraunces text-3xl text-charcoal">Shopping cart</h1>
              <p className="mt-2 text-sm text-charcoal/70">Review your items and update quantities before checkout.</p>
            </div>
            <span className="rounded-full bg-ivory px-4 py-2 text-sm font-semibold text-charcoal">{items.length} items</span>
          </div>

          <div className="mt-8 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="grid gap-4 rounded-[1.25rem] border border-gold/15 bg-ivory/70 p-4 sm:grid-cols-[140px_1fr_180px]">
                <div className="overflow-hidden rounded-[1.25rem] bg-white">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-3">
                  <div>
                    <h2 className="font-semibold text-charcoal">{item.name}</h2>
                    <p className="text-sm text-charcoal/70">₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-sm font-medium text-charcoal/80">Qty</label>
                    <div className="flex items-center gap-2 rounded-full border border-gold/15 bg-white px-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="h-9 w-9 rounded-full text-lg font-semibold text-charcoal transition hover:bg-gold/10"
                        aria-label={`Decrease quantity for ${item.name}`}
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-charcoal">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="h-9 w-9 rounded-full text-lg font-semibold text-charcoal transition hover:bg-gold/10"
                        aria-label={`Increase quantity for ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-between rounded-[1rem] bg-white p-4 text-right">
                  <p className="text-sm text-charcoal/70">Item total</p>
                  <p className="mt-1 text-lg font-semibold text-charcoal">{formatPrice(item.price * item.quantity)}</p>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    className="mt-3 text-sm font-semibold text-maroon transition hover:text-maroon/80"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-[1.5rem] border border-gold/15 bg-white/80 p-6 shadow-soft">
          <h2 className="font-fraunces text-2xl text-charcoal">Order summary</h2>
          <div className="mt-6 space-y-4 text-sm text-charcoal/75">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-gold/10 pt-4 text-lg font-semibold text-charcoal">
            <span>Total</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
          <button
            type="button"
            onClick={() => router.push('/checkout')}
            className="mt-8 w-full rounded-full bg-gold px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold-dark"
          >
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </main>
  );
}
