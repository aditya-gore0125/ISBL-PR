import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import SafeImage from '@/components/SafeImage';

const orderTimeline = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export default async function AccountOrderPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/login?redirect=/account/orders/${params.orderId}`);
  }
  if (!mongoose.isValidObjectId(params.orderId)) notFound();

  await connectToDatabase();
  const order = await Order.findById(params.orderId).lean();
  if (!order) notFound();

  const currentUser = await User.findById(session.user.id).select('role').lean();
  const isOwner = order.user.toString() === session.user.id;
  if (!isOwner && currentUser?.role !== 'admin') notFound();

  const currentStep = orderTimeline.indexOf(order.orderStatus || 'pending');
  const isTerminalStatus = ['cancelled', 'returned'].includes(order.orderStatus);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Order details</p>
          <h1 className="mt-2 font-fraunces text-3xl text-charcoal">Order #{order._id.toString().slice(-6).toUpperCase()}</h1>
          <p className="mt-2 text-sm text-charcoal/70">{formatPrice(order.totalAmount)} · Payment {order.paymentStatus}</p>
        </div>
        <Link href="/account#orders" className="rounded-full border border-gold/20 px-4 py-2 text-sm font-semibold text-charcoal">Back to orders</Link>
      </div>

      <section className="mt-8 rounded-[1.25rem] border border-gold/15 bg-white/90 p-6 shadow-soft">
        <h2 className="font-fraunces text-xl text-charcoal">Order status</h2>
        {isTerminalStatus ? (
          <p className="mt-4 inline-flex rounded-full bg-maroon/10 px-3 py-1.5 text-sm font-semibold capitalize text-maroon">{order.orderStatus}</p>
        ) : (
          <ol className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {orderTimeline.map((step, index) => {
              const complete = currentStep >= 0 && index <= currentStep;
              return (
                <li key={step} className="flex items-center gap-2 text-sm capitalize text-charcoal/70">
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${complete ? 'bg-gold text-white' : 'bg-charcoal/5 text-charcoal/50'}`}>
                    {complete ? '✓' : index + 1}
                  </span>
                  {step.replaceAll('_', ' ')}
                </li>
              );
            })}
          </ol>
        )}
        {order.needsReview ? <p className="mt-4 text-sm text-maroon">Your paid order is being reviewed. We will update its status shortly.</p> : null}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[1.25rem] border border-gold/15 bg-white/90 p-6">
          <h2 className="font-fraunces text-xl text-charcoal">Items</h2>
          <div className="mt-5 space-y-4">
            {order.items.map((item, index) => (
              <div key={`${item.product}-${index}`} className="flex items-center gap-4 border-b border-gold/10 pb-4 last:border-0 last:pb-0">
                <SafeImage src={item.image || '/hero-placeholder.svg'} alt={item.name} width={64} height={64} className="h-16 w-16 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-charcoal">{item.name}</p>
                  <p className="mt-1 text-sm text-charcoal/70">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-charcoal">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[1.25rem] border border-gold/15 bg-white/90 p-6">
            <h2 className="font-fraunces text-xl text-charcoal">Shipping address</h2>
            <div className="mt-4 text-sm leading-6 text-charcoal/75">
              <p className="font-semibold text-charcoal">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 ? <p>{order.shippingAddress.addressLine2}</p> : null}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p>{order.shippingAddress.phone}</p>
            </div>
          </section>
          <section className="rounded-[1.25rem] border border-gold/15 bg-white/90 p-6">
            <h2 className="font-fraunces text-xl text-charcoal">Delivery tracking</h2>
            <p className="mt-4 text-sm text-charcoal/75"><span className="font-semibold">Courier:</span> {order.courierPartner || 'Not assigned yet'}</p>
            <p className="mt-2 break-all text-sm text-charcoal/75"><span className="font-semibold">Tracking ID:</span> {order.trackingId || 'Not assigned yet'}</p>
          </section>
        </aside>
      </div>
    </main>
  );
}