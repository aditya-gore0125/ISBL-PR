import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

function formatPrice(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

export default async function OrderConfirmationPage({ params }) {
  await connectToDatabase();
  const order = await Order.findById(params.orderId).lean();

  if (!order) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[1.5rem] border border-gold/15 bg-white/80 p-10 text-center shadow-soft">
          <h1 className="font-fraunces text-3xl text-charcoal">Order not found</h1>
          <p className="mt-4 text-sm text-charcoal/70">We could not locate that order. Please check the order URL or return to shopping.</p>
          <Link href="/" className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-semibold text-white transition hover:bg-gold-dark">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[1.5rem] border border-gold/15 bg-white/90 p-8 shadow-soft">
        <div className="space-y-4 text-center">
          <h1 className="font-fraunces text-4xl text-charcoal">Thank you for your order!</h1>
          <p className="text-sm text-charcoal/70">Your payment is confirmed and we’re getting your package ready.</p>
          <p className="text-sm text-charcoal/75">Order number: <span className="font-semibold text-charcoal">{order._id}</span></p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <section className="rounded-[1.5rem] border border-gold/15 bg-ivory/70 p-6">
            <h2 className="font-fraunces text-2xl text-charcoal">Order details</h2>
            <div className="mt-6 space-y-4 text-sm text-charcoal/75">
              <div className="rounded-[1rem] bg-white p-4">
                <p className="font-semibold text-charcoal">Shipping address</p>
                <p className="mt-2 leading-7">
                  {order.shippingAddress.fullName}<br />
                  {order.shippingAddress.addressLine1}<br />
                  {order.shippingAddress.addressLine2 ? `${order.shippingAddress.addressLine2}\n` : null}
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
                  {order.shippingAddress.phone}
                </p>
              </div>
              <div className="rounded-[1rem] bg-white p-4">
                <p className="font-semibold text-charcoal">Items</p>
                <ul className="mt-3 space-y-3">
                  {order.items.map((item) => (
                    <li key={item.product.toString()} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="h-16 w-16 rounded-[1rem] object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold text-charcoal">{item.name}</p>
                        <p className="text-sm text-charcoal/70">{item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                      <p className="font-semibold text-charcoal">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <aside className="rounded-[1.5rem] border border-gold/15 bg-white p-6">
            <div className="space-y-4">
              <div>
                <h2 className="font-fraunces text-2xl text-charcoal">Order summary</h2>
                <p className="mt-2 text-sm text-charcoal/70">Estimated delivery: 3–5 business days.</p>
              </div>
              <div className="rounded-[1rem] bg-ivory/70 p-4 text-sm text-charcoal/75">
                <div className="flex items-center justify-between">
                  <span>Order total</span>
                  <span className="font-semibold text-charcoal">{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span>Payment status</span>
                  <span className="font-semibold text-emerald-700">{order.paymentStatus}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span>Order status</span>
                  <span className="font-semibold text-charcoal">{order.orderStatus}</span>
                </div>
                {order.trackingId || order.courierPartner ? (
                  <div className="mt-3 border-t border-gold/10 pt-3">
                    <div className="flex items-center justify-between">
                      <span>Courier</span>
                      <span className="font-semibold text-charcoal">{order.courierPartner || 'Not assigned yet'}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span>Tracking ID</span>
                      <span className="font-semibold text-charcoal">{order.trackingId || '—'}</span>
                    </div>
                  </div>
                ) : null}
              </div>
              <Link href="/account/orders" className="inline-flex w-full justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold-dark">
                View Order History
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
