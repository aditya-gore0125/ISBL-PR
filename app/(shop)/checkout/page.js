'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/lib/CartContext';
import SafeImage from '@/components/SafeImage';

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

function loadRazorpayCheckout(onError) {
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    let script = document.querySelector('script[data-razorpay-checkout]');
    const onLoad = () => resolve(Boolean(window.Razorpay));
    const onScriptError = () => {
      script.remove();
      onError();
      resolve(false);
    };

    if (!script) {
      script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.dataset.razorpayCheckout = 'true';
    }

    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onScriptError, { once: true });
    if (!script.isConnected) document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { items, clearCart, hydrated } = useCart();
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
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [serverTotal, setServerTotal] = useState(null);
  const [pendingCapture, setPendingCapture] = useState(null);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.replace('/login?redirect=/checkout');
    }
  }, [router, sessionStatus]);

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return;

    fetch('/api/account')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data?.message || 'Unable to load saved addresses.');
        const savedAddresses = data.user?.addresses || [];
        setAddresses(savedAddresses);
        const defaultIndex = savedAddresses.findIndex((savedAddress) => savedAddress.isDefault);
        if (defaultIndex >= 0) {
          setSelectedAddressIndex(defaultIndex);
          setAddress({ ...savedAddresses[defaultIndex] });
        }
      })
      .catch((error) => {
        console.error('Load checkout addresses error', error);
        setMessage(error.message || 'Unable to load saved addresses.');
      });
  }, [sessionStatus]);

  useEffect(() => {
    if (hydrated && !items.length) {
      router.replace('/cart');
    }
  }, [hydrated, items, router]);

  const handleInputChange = (field, value) => {
    setSelectedAddressIndex(null);
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const chooseAddress = (index) => {
    setSelectedAddressIndex(index);
    setAddress({ ...addresses[index] });
    setErrors({});
  };

  const savePaidOrder = async (capture) => {
    setStatus('processing');
    setMessage('Verifying payment...');

    try {
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: capture.orderId,
          razorpay_payment_id: capture.paymentId,
          razorpay_signature: capture.signature,
          shippingAddress: capture.shippingAddress,
          items: capture.items,
        }),
      });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData?.message || 'Unable to save your paid order.');

      setPendingCapture(null);
      clearCart();
      router.push(`/order-confirmation/${orderData.order._id}`);
    } catch (error) {
      setPendingCapture(capture);
      setStatus('failed');
      setMessage(error.message || 'Payment succeeded, but order confirmation failed. Retry confirmation safely.');
    }
  };

  const handlePayNow = async () => {
    if (pendingCapture) {
      setStatus('submitting');
      await savePaidOrder(pendingCapture);
      return;
    }

    const validationErrors = validateAddress(address);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setStatus('submitting');
    setServerTotal(null);
    setMessage('Creating payment order...');

    try {
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || 'Unable to create Razorpay order.');
      }
      setServerTotal(result.serverTotal);
      const loaded = await loadRazorpayCheckout(() => {
        setStatus('failed');
        setMessage('Unable to load Razorpay checkout. Your cart and address are saved; retry payment.');
      });
      if (!loaded) return;

      const options = {
        key: result.key,
        amount: result.amount,
        currency: result.currency,
        name: 'Nandini Jewellers',
        description: 'Order payment',
        order_id: result.orderId,
        handler: async (paymentResponse) => savePaidOrder({
          orderId: result.orderId,
          paymentId: paymentResponse.razorpay_payment_id,
          signature: paymentResponse.razorpay_signature,
          shippingAddress: { ...address },
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
        modal: {
          ondismiss: () => {
            setStatus('failed');
            setMessage('Payment was dismissed. Your cart and address are saved; retry when ready.');
          },
        },
        prefill: {
          name: address.fullName,
          email: session?.user?.email || '',
          contact: address.phone,
        },
      };

      setStatus('processing');
      setMessage('Opening Razorpay checkout...');
      const checkout = new window.Razorpay(options);
      checkout.open();
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
              {addresses.length ? (
                <div className="mt-5 space-y-3">
                  {addresses.map((savedAddress, index) => (
                    <label key={`${savedAddress.fullName}-${index}`} className="flex cursor-pointer gap-3 rounded-[1rem] border border-gold/15 bg-white p-4 text-sm text-charcoal">
                      <input
                        type="radio"
                        name="checkout-address"
                        checked={selectedAddressIndex === index}
                        onChange={() => chooseAddress(index)}
                        className="mt-1 h-4 w-4 accent-gold"
                      />
                      <span>
                        <span className="block font-semibold">{savedAddress.fullName}{savedAddress.isDefault ? ' · Default' : ''}</span>
                        <span className="mt-1 block leading-6 text-charcoal/70">
                          {savedAddress.addressLine1}{savedAddress.addressLine2 ? `, ${savedAddress.addressLine2}` : ''}, {savedAddress.city}, {savedAddress.state} - {savedAddress.pincode}<br />
                          {savedAddress.phone}
                        </span>
                      </span>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddressIndex(null);
                      setAddress({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' });
                    }}
                    className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold ${selectedAddressIndex === null ? 'border-gold bg-gold/10 text-gold-dark' : 'border-gold/20 bg-white text-charcoal'}`}
                  >
                    Use a new address
                  </button>
                </div>
              ) : null}
              {selectedAddressIndex === null ? (
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
              ) : null}
            </div>

            <div className="rounded-[1.25rem] border border-gold/15 bg-ivory/70 p-6">
              <h2 className="font-semibold text-charcoal">Order review</h2>
              <div className="mt-4 space-y-3 text-sm text-charcoal/75">
                <div className="flex items-center justify-between">
                  <span>Items</span>
                  <span>{items.length}</span>
                </div>
                <div className="border-t border-gold/10 pt-4 text-lg font-semibold text-charcoal">
                  <div className="flex items-center justify-between">
                    <span>Total</span>
                    <span>{serverTotal === null ? 'Calculated at payment' : formatPrice(serverTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePayNow}
              disabled={status === 'submitting' || status === 'processing'}
              className="min-h-11 w-full rounded-full bg-gold px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'failed' ? pendingCapture ? 'Retry order confirmation' : 'Retry payment' : status === 'submitting' ? 'Preparing payment...' : status === 'processing' ? 'Payment in progress...' : 'Pay Now'}
            </button>

            {message ? <div className="rounded-[1rem] border border-gold/15 bg-ivory/80 px-4 py-3 text-sm text-charcoal">{message}</div> : null}
          </div>
        </section>

        <aside className="rounded-[1.5rem] border border-gold/15 bg-white/80 p-6 shadow-soft">
          <h2 className="font-fraunces text-2xl text-charcoal">Order summary</h2>
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 rounded-[1rem] bg-ivory/60 p-3">
                <SafeImage src={item.image || '/hero-placeholder.svg'} alt={item.name} width={64} height={64} className="h-16 w-16 rounded-[1rem] object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-charcoal">{item.name}</p>
                  <p className="text-sm text-charcoal/70">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
