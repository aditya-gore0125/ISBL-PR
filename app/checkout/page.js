'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/lib/CartContext';

function formatPrice(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function validateAddress(address) {
  const errors = {};
  if (!address.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!/^[6-9]\d{9}$/.test(address.phone)) errors.phone = 'Enter a valid 10-digit mobile number.';
  if (!address.addressLine1.trim()) errors.addressLine1 = 'Address line 1 is required.';
  if (!address.city.trim()) errors.city = 'City is required.';
  if (!address.state.trim()) errors.state = 'State is required.';
  if (!/^[1-9][0-9]{5}$/.test(address.pincode)) errors.pincode = 'Enter a valid 6-digit pincode.';
  return errors;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const { items, cartTotal, clearCart, hydrated } = useCart();
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.replace('/login?redirect=/checkout');
    }
  }, [router, sessionStatus]);

  useEffect(() => {
    if (hydrated && !items.length) {
      router.replace('/cart');
    }
  }, [hydrated, items, router]);

  const shipping = cartTotal >= 999 || cartTotal === 0 ? 0 : 99;
  const totalAmount = cartTotal + shipping;

  const requestBody = useMemo(() => ({
    amount: totalAmount * 100,
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  }), [totalAmount]);

  const handleInputChange = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handlePayNow = async () => {
    const validationErrors = validateAddress(address);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setStatus('submitting');
    setMessage('Creating payment order...');

    try {
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: requestBody.amount, receipt: requestBody.receipt }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || 'Unable to create Razorpay order.');
      }
      setOrderId(result.orderId);
      const options = {
        key: result.key,
        amount: result.amount,
        currency: result.currency,
        name: 'Nandini Jewellers',
        description: 'Order payment',
        order_id: result.orderId,
        handler: async (paymentResponse) => {
          setStatus('processing');
          setMessage('Verifying payment...');
          const orderResponse = await fetch('/api/orders/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: result.orderId,
              paymentId: paymentResponse.razorpay_payment_id,
              signature: paymentResponse.razorpay_signature,
              shippingAddress: address,
              items,
              totalAmount,
            }),
          });
          const orderData = await orderResponse.json();
          if (!orderResponse.ok) {
            setStatus('failed');
            setMessage(orderData?.message || 'Payment succeeded, but saving order failed.');
            return;
          }
          clearCart();
          router.push(`/order-confirmation/${orderData.order._id}`);
        },
        modal: {
          ondismiss: () => {
            setStatus('idle');
            setMessage('Payment was cancelled. You can retry without losing your cart.');
          },
        },
      };

      // Load Razorpay checkout script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const checkout = new window.Razorpay(options);
        checkout.open();
      };
      script.onerror = () => {
        throw new Error('Failed to load Razorpay checkout script.');
      };
      document.body.appendChild(script);
      setStatus('ready');
      setMessage('Opening Razorpay checkout...');
    } catch (error) {
      console.error(error);
      setStatus('failed');
      setMessage(error.message || 'Unable to complete payment.');
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded-[1.5rem] border border-gold/15 bg-white/80 p-6 shadow-soft">
          <h1 className="font-fraunces text-3xl text-charcoal">Checkout</h1>
          <p className="mt-2 text-sm text-charcoal/70">Complete your order with shipping details and payment.</p>

          <div className="mt-8 space-y-6">
            <div className="rounded-[1.25rem] border border-gold/15 bg-ivory/70 p-6">
              <h2 className="font-semibold text-charcoal">Shipping address</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Full Name', name: 'fullName' },
                  { label: 'Phone', name: 'phone' },
                  { label: 'Address line 1', name: 'addressLine1', full: true },
                  { label: 'Address line 2', name: 'addressLine2', full: true },
                  { label: 'City', name: 'city' },
                  { label: 'State', name: 'state' },
                  { label: 'Pincode', name: 'pincode' },
                ].map((field) => (
                  <label key={field.name} className={field.full ? 'sm:col-span-2' : ''}>
                    <span className="text-sm font-medium text-charcoal/80">{field.label}</span>
                    <input
                      value={address[field.name]}
                      onChange={(event) => handleInputChange(field.name, event.target.value)}
                      className="mt-2 h-12 w-full rounded-[1rem] border border-gold/20 bg-white px-4 text-sm text-charcoal outline-none transition focus:border-gold"
                      type="text"
                    />
                    {errors[field.name] ? <p className="mt-1 text-xs text-maroon">{errors[field.name]}</p> : null}
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-gold/15 bg-ivory/70 p-6">
              <h2 className="font-semibold text-charcoal">Order review</h2>
              <div className="mt-4 space-y-3 text-sm text-charcoal/75">
                <div className="flex items-center justify-between">
                  <span>Items</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-gold/10 pt-4 text-lg font-semibold text-charcoal">
                  <div className="flex items-center justify-between">
                    <span>Total</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePayNow}
              className="w-full rounded-full bg-gold px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold-dark"
            >
              Pay Now
            </button>

            {message ? <div className="rounded-[1rem] border border-gold/15 bg-ivory/80 px-4 py-3 text-sm text-charcoal">{message}</div> : null}
          </div>
        </section>

        <aside className="rounded-[1.5rem] border border-gold/15 bg-white/80 p-6 shadow-soft">
          <h2 className="font-fraunces text-2xl text-charcoal">Order summary</h2>
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 rounded-[1rem] bg-ivory/60 p-3">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-[1rem] object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-charcoal">{item.name}</p>
                  <p className="text-sm text-charcoal/70">{item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                </div>
                <p className="font-semibold text-charcoal">₹{(item.quantity * item.price).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
