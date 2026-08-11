'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const orderStatuses = ['all', 'pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusClasses(status) {
  const key = String(status || '').toLowerCase();
  const map = {
    pending: 'bg-slate-100 text-slate-700',
    confirmed: 'bg-rose-100 text-rose-700',
    packed: 'bg-yellow-100 text-yellow-700',
    shipped: 'bg-yellow-100 text-yellow-700',
    out_for_delivery: 'bg-amber-100 text-amber-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    returned: 'bg-red-100 text-red-700',
  };
  return map[key] || 'bg-slate-100 text-slate-700';
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/admin/orders');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Unable to load orders.');
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') {
      return orders;
    }

    return orders.filter((order) => String(order.orderStatus || 'pending') === statusFilter);
  }, [orders, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Orders</p>
          <h2 className="mt-2 font-fraunces text-3xl text-charcoal">Order management</h2>
        </div>

        <label className="flex items-center gap-3 rounded-full border border-gold/15 bg-white px-3 py-2 text-sm text-charcoal">
          <span className="font-medium">Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="bg-transparent outline-none">
            {orderStatuses.map((status) => (
              <option key={status} value={status}>{status === 'all' ? 'All statuses' : status.replace('_', ' ')}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-gold/15 bg-white shadow-soft">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-charcoal/70">Loading orders…</div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-ivory text-charcoal/70">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order ID</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.length ? (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="border-t border-gold/10 align-middle">
                      <td className="px-4 py-3 font-medium text-charcoal">#{order._id.slice(-6)}</td>
                      <td className="px-4 py-3 text-charcoal/80">{order.user?.name || 'Guest customer'}</td>
                      <td className="px-4 py-3 text-charcoal/80">{formatPrice(order.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold capitalize ${getStatusClasses(order.orderStatus)}`}>
                          {order.orderStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-charcoal/70">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${order._id}`} className="rounded-full border border-gold/25 bg-gold/5 px-3 py-1.5 text-xs font-semibold text-charcoal hover:bg-gold/10">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-sm text-charcoal/60">
                      No orders match the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
