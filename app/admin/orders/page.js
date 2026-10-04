'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatOrderId } from '@/lib/utils';

const orderStatuses = ['all', 'pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];
const paymentStatuses = ['all', 'pending', 'paid', 'failed'];
const sortOptions = [
  { value: '-createdAt', label: 'Newest first' },
  { value: 'createdAt', label: 'Oldest first' },
  { value: '-totalAmount', label: 'Highest total' },
  { value: 'totalAmount', label: 'Lowest total' },
];

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
    pending: 'bg-charcoal/5 text-charcoal/70',
    confirmed: 'bg-blush/20 text-maroon',
    packed: 'bg-gold/15 text-gold-dark',
    shipped: 'bg-gold/15 text-gold-dark',
    out_for_delivery: 'bg-gold/15 text-gold-dark',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-maroon/10 text-maroon',
    returned: 'bg-maroon/10 text-maroon',
  };
  return map[key] || 'bg-charcoal/5 text-charcoal/70';
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ page: String(page), limit: '20', sort });
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (paymentStatusFilter !== 'all') params.set('paymentStatus', paymentStatusFilter);
        if (search.trim()) params.set('q', search.trim());
        const response = await fetch(`/api/admin/orders?${params.toString()}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || 'Unable to load orders.');
        }
        if (active) {
          setOrders(data.orders || []);
          setPage(data.page || 1);
          setPages(data.pages || 1);
          setTotal(data.total || 0);
        }
      } catch (error) {
        if (active) setError(error.message || 'Unable to load orders.');
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [page, paymentStatusFilter, search, sort, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Orders</p>
          <h2 className="mt-2 font-fraunces text-3xl text-charcoal">Order management</h2>
        </div>

      </div>

      <div className="grid gap-3 rounded-[1rem] border border-gold/15 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-charcoal/60">Search</span>
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Order ID, customer, email, phone" className="h-10 w-full rounded-lg border border-gold/20 bg-ivory px-3 text-sm text-charcoal outline-none focus:border-gold" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-charcoal/60">Order status</span>
          <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="h-10 w-full rounded-lg border border-gold/20 bg-ivory px-3 text-sm text-charcoal outline-none focus:border-gold">
            {orderStatuses.map((status) => (
              <option key={status} value={status}>{status === 'all' ? 'All statuses' : status.replaceAll('_', ' ')}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-charcoal/60">Payment status</span>
          <select value={paymentStatusFilter} onChange={(event) => { setPaymentStatusFilter(event.target.value); setPage(1); }} className="h-10 w-full rounded-lg border border-gold/20 bg-ivory px-3 text-sm text-charcoal outline-none focus:border-gold">
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>{status === 'all' ? 'All payments' : status}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-charcoal/60">Sort</span>
          <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="h-10 w-full rounded-lg border border-gold/20 bg-ivory px-3 text-sm text-charcoal outline-none focus:border-gold">
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-gold/15 bg-white shadow-soft">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-charcoal/70">Loading orders…</div>
          ) : error ? (
            <div className="p-6 text-sm text-maroon">{error}</div>
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
                {orders.length ? (
                  orders.map((order) => (
                    <tr key={order._id} className="border-t border-gold/10 align-middle">
                      <td className="px-4 py-3 font-medium text-charcoal">{formatOrderId(order._id)}</td>
                      <td className="px-4 py-3 text-charcoal/80">{order.user?.name || 'Guest customer'}<span className="block text-xs text-charcoal/55">{order.user?.email || order.user?.phone || ''}</span></td>
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
                      No orders match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 text-sm text-charcoal/70 sm:flex-row sm:items-center sm:justify-between">
        <p>{total ? `Showing ${(page - 1) * 20 + 1}-${Math.min(page * 20, total)} of ${total} orders` : 'No orders'}</p>
        <div className="flex items-center gap-3">
          <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-gold/20 px-3 py-2 font-medium text-charcoal disabled:opacity-40">Previous</button>
          <span>Page {page} of {pages}</span>
          <button type="button" disabled={page >= pages || loading} onClick={() => setPage((current) => Math.min(pages, current + 1))} className="rounded-lg border border-gold/20 px-3 py-2 font-medium text-charcoal disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
}
