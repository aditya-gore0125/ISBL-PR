'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const orderPipeline = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function AdminOrderDetailPage({ params }) {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Unable to load order.');
        }

        setOrder(data.order);
      } catch (loadError) {
        setError(loadError.message || 'Unable to load order.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: order.orderStatus,
          trackingId: order.trackingId || '',
          courierPartner: order.courierPartner || '',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Unable to update order.');
      }

      setOrder(data.order);
      router.refresh();
    } catch (saveError) {
      setError(saveError.message || 'Unable to update order.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-[1.5rem] border border-gold/15 bg-white p-6 text-sm text-charcoal/70">Loading order…</div>;
  }

  if (!order) {
    return <div className="rounded-[1.5rem] border border-maroon/15 bg-white p-6 text-sm text-maroon">{error || 'Order not found.'}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Order details</p>
          <h2 className="mt-2 font-fraunces text-3xl text-charcoal">#{order._id.slice(-6)}</h2>
        </div>
        <Link href="/admin/orders" className="rounded-full border border-gold/25 bg-gold/5 px-4 py-2 text-sm font-semibold text-charcoal transition hover:bg-gold/10">
          Back to orders
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[1.5rem] border border-gold/15 bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-fraunces text-2xl text-charcoal">Customer & shipping</h3>
            <span className="rounded-full bg-gold/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
              {order.paymentStatus}
            </span>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-charcoal/55">Customer</dt>
              <dd className="mt-1 text-sm font-medium text-charcoal">{order.user?.name || 'Guest customer'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-charcoal/55">Phone</dt>
              <dd className="mt-1 text-sm text-charcoal/80">{order.user?.phone || order.shippingAddress?.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-charcoal/55">Email</dt>
              <dd className="mt-1 text-sm text-charcoal/80">{order.user?.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-charcoal/55">Placed on</dt>
              <dd className="mt-1 text-sm text-charcoal/80">{formatDate(order.createdAt)}</dd>
            </div>
          </dl>

          <div className="mt-6 rounded-[1rem] border border-gold/10 bg-ivory p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/55">Shipping address</p>
            <div className="mt-3 text-sm text-charcoal/80">
              <p>{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 ? <p>{order.shippingAddress.addressLine2}</p> : null}
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="mb-3 font-fraunces text-xl text-charcoal">Items</h4>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={`${item.product}-${item.name}`} className="flex items-center justify-between rounded-[1rem] border border-gold/10 bg-ivory p-3">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{item.name}</p>
                      <p className="text-xs text-charcoal/60">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-charcoal">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-gold/15 bg-white p-5 shadow-soft">
          <h3 className="font-fraunces text-2xl text-charcoal">Shipping status</h3>

          <form onSubmit={handleSave} className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-charcoal/80">Order status</span>
              <select
                value={order.orderStatus || 'pending'}
                onChange={(event) => setOrder((current) => ({ ...current, orderStatus: event.target.value }))}
                className="h-12 w-full rounded-[1rem] border border-gold/20 bg-ivory px-4 text-sm text-charcoal outline-none focus:border-gold"
              >
                {orderPipeline.map((status) => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-charcoal/80">Tracking ID</span>
              <input
                value={order.trackingId || ''}
                onChange={(event) => setOrder((current) => ({ ...current, trackingId: event.target.value }))}
                className="h-12 w-full rounded-[1rem] border border-gold/20 bg-ivory px-4 text-sm text-charcoal outline-none focus:border-gold"
                placeholder="AWB123456789"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-charcoal/80">Courier partner</span>
              <input
                value={order.courierPartner || ''}
                onChange={(event) => setOrder((current) => ({ ...current, courierPartner: event.target.value }))}
                className="h-12 w-full rounded-[1rem] border border-gold/20 bg-ivory px-4 text-sm text-charcoal outline-none focus:border-gold"
                placeholder="Blue Dart, Delhivery, etc."
              />
            </label>

            <div className="rounded-[1rem] border border-gold/10 bg-ivory p-4 text-sm text-charcoal/75">
              <p className="font-semibold text-charcoal">Total amount</p>
              <p className="mt-1 text-xl font-fraunces text-charcoal">{formatPrice(order.totalAmount)}</p>
            </div>

            {error ? <div className="rounded-[1rem] border border-maroon/20 bg-maroon/5 px-4 py-3 text-sm text-maroon">{error}</div> : null}

            <button type="submit" disabled={saving} className="w-full rounded-full bg-gold px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-70">
              {saving ? 'Saving changes...' : 'Save shipping update'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
