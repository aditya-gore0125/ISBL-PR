'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

const palette = ['#C29D5D', '#DDA8B2', '#7B2D3A', '#9C7A3F', '#6F7F73', '#A58C7A'];
const periodOptions = ['monthly', 'quarterly', 'yearly'];

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function Change({ value }) {
  const positive = Number(value) >= 0;
  return (
    <span className={`text-xs font-semibold ${positive ? 'text-emerald-700' : 'text-maroon'}`}>
      {positive ? '↑' : '↓'} {Math.abs(Number(value || 0)).toFixed(1)}% vs previous period
    </span>
  );
}

function ChartCard({ title, children, empty }) {
  return (
    <section className="min-w-0 rounded-[1.25rem] border border-gold/15 bg-white p-4 shadow-soft sm:p-5">
      <h2 className="font-fraunces text-xl text-charcoal">{title}</h2>
      {empty ? (
        <div className="mt-5 grid min-h-72 place-items-center rounded-[1rem] border border-dashed border-gold/25 bg-ivory/60 px-4 text-center text-sm text-charcoal/60">
          No sales in this period
        </div>
      ) : <div className="mt-4 h-72 min-w-0">{children}</div>}
    </section>
  );
}

function TooltipBox({ active, payload, label, currency = false }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gold/20 bg-white px-3 py-2 text-xs shadow-soft">
      {label ? <p className="mb-1 font-semibold text-charcoal">{label}</p> : null}
      {payload.map((item) => (
        <p key={item.dataKey || item.name} style={{ color: item.color || item.payload?.fill }}>
          {item.name}: {currency ? formatCurrency(item.value) : Number(item.value).toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div aria-label="Loading analytics" className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-28 rounded-[1.25rem] bg-gold/10" />)}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-80 rounded-[1.25rem] bg-gold/10" />)}
      </div>
    </div>
  );
}

function downloadCsv(rows) {
  const headers = ['Product', 'Category', 'Units sold', 'Revenue'];
  const lines = rows.map((row) => [row.name, row.category, row.unitsSold, row.revenue]
    .map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','));
  const blob = new Blob([[headers.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'selected-period-sales.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

function ResponsiveTable({ children, label }) {
  return <div role="region" aria-label={label} className="mt-4 overflow-x-auto"><table className="w-full min-w-[38rem] text-left text-sm">{children}</table></div>;
}

export default function AnalyticsDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const period = periodOptions.includes(searchParams.get('period')) ? searchParams.get('period') : 'monthly';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setError('');
    const params = new URLSearchParams({ period });
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    fetch(`/api/admin/analytics?${params}`, { cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || 'Unable to load analytics');
        if (active) setData(payload);
      })
      .catch((loadError) => active && setError(loadError.message));
    return () => { active = false; };
  }, [period, from, to]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (period !== 'monthly') params.set('period', period);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    return params.toString();
  }, [period, from, to]);

  function updateParams(next) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
    router.replace(`${pathname}${params.toString() ? `?${params}` : ''}`, { scroll: false });
  }

  const kpis = data ? [
    ['Total revenue', formatCurrency(data.kpis.revenue), data.changes.revenue],
    ['Total orders', data.kpis.orders.toLocaleString('en-IN'), data.changes.orders],
    ['Average order value', formatCurrency(data.kpis.averageOrderValue), data.changes.averageOrderValue],
    ['Units sold', data.kpis.units.toLocaleString('en-IN'), data.changes.units],
    ['New customers', data.kpis.newCustomers.toLocaleString('en-IN'), data.changes.newCustomers],
  ] : [];
  const noSales = data?.kpis.revenue === 0;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 rounded-[1.25rem] border border-gold/15 bg-white p-4 shadow-soft md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">Store analytics</p>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Analytics period">
            {periodOptions.map((option) => (
              <button key={option} type="button" onClick={() => updateParams({ period: option })} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${period === option ? 'bg-gold text-white' : 'border border-gold/20 bg-ivory text-charcoal hover:border-gold'}`}>
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">From
            <input type="date" value={from} onChange={(event) => updateParams({ from: event.target.value })} className="mt-1 block min-h-11 w-full rounded-lg border border-gold/20 bg-ivory px-3 text-sm normal-case text-charcoal" />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">To
            <input type="date" value={to} onChange={(event) => updateParams({ to: event.target.value })} className="mt-1 block min-h-11 w-full rounded-lg border border-gold/20 bg-ivory px-3 text-sm normal-case text-charcoal" />
          </label>
        </div>
        <span className="sr-only">Query: {queryString}</span>
      </section>

      {error ? <div role="alert" className="rounded-xl border border-maroon/20 bg-maroon/5 p-4 text-sm text-maroon">{error}</div> : null}
      {!data && !error ? <Skeleton /> : null}

      {data ? (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {kpis.map(([label, value, change], index) => (
              <div key={label} className="rounded-[1.25rem] border border-gold/15 bg-white p-4 shadow-soft">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-charcoal/55">{label}</p>
                <p className={`mt-2 font-fraunces text-charcoal ${index === 0 ? 'text-2xl' : 'text-3xl'}`}>{value}</p>
                <div className="mt-3"><Change value={change} /></div>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Revenue over time" empty={noSales}>
              <ResponsiveContainer width="100%" height="100%"><AreaChart data={data.charts.revenueOverTime} margin={{ left: -10 }}><CartesianGrid stroke="#DCCFBB" vertical={false}/><XAxis dataKey="period" tick={{ fontSize: 11 }} /><YAxis tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} tick={{ fontSize: 11 }} /><Tooltip content={<TooltipBox currency />} /><Area type="monotone" dataKey="revenue" name="Revenue" stroke="#9C7A3F" fill="#C29D5D" fillOpacity={0.25} /></AreaChart></ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Orders over time" empty={noSales}>
              <ResponsiveContainer width="100%" height="100%"><BarChart data={data.charts.ordersOverTime} margin={{ left: -25 }}><CartesianGrid stroke="#DCCFBB" vertical={false}/><XAxis dataKey="period" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip content={<TooltipBox />} /><Bar dataKey="orders" name="Orders" fill="#C29D5D" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer>
            </ChartCard>
            {[
              ['Sales by category', data.charts.salesByCategory, 'category'],
              ['Orders by status', data.charts.orderStatuses, 'status'],
              ['Payment status split', data.charts.paymentStatuses, 'payment'],
            ].map(([title, chartData, key]) => (
              <ChartCard key={title} title={title} empty={!chartData.length}>
                <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="48%" innerRadius="48%" outerRadius="78%" paddingAngle={2}>{chartData.map((item, index) => <Cell key={`${key}-${item.name}`} fill={palette[index % palette.length]} />)}</Pie><Tooltip content={<TooltipBox />} /><Legend wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer>
              </ChartCard>
            ))}
            <ChartCard title="Top 10 best-selling products" empty={!data.charts.topProducts.length}>
              <ResponsiveContainer width="100%" height="100%"><BarChart data={data.charts.topProducts} layout="vertical" margin={{ left: 8, right: 12 }}><CartesianGrid stroke="#DCCFBB" horizontal={false}/><XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} /><Tooltip content={<TooltipBox />} /><Bar dataKey="unitsSold" name="Units sold" fill="#7B2D3A" radius={[0,5,5,0]} /></BarChart></ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Revenue by material" empty={!data.charts.revenueByMaterial.length}>
              <ResponsiveContainer width="100%" height="100%"><BarChart data={data.charts.revenueByMaterial} margin={{ left: -10 }}><CartesianGrid stroke="#DCCFBB" vertical={false}/><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} tick={{ fontSize: 11 }} /><Tooltip content={<TooltipBox currency />} /><Bar dataKey="value" name="Revenue" fill="#DDA8B2" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer>
            </ChartCard>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-[1.25rem] border border-gold/15 bg-white p-4 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-fraunces text-xl text-charcoal">Top 10 sold products</h2>
                <button type="button" onClick={() => downloadCsv(data.tables.topProducts)} disabled={!data.tables.topProducts.length} className="rounded-full border border-gold/30 px-3 py-2 text-xs font-semibold text-charcoal disabled:opacity-40">Download CSV</button>
              </div>
              {data.tables.topProducts.length ? <ResponsiveTable label="Top sold products"><thead><tr className="border-b border-gold/15 text-xs uppercase tracking-wider text-charcoal/55"><th className="py-2">Product</th><th>Category</th><th>Units</th><th>Revenue</th></tr></thead><tbody>{data.tables.topProducts.map((row) => <tr key={row.productId} className="border-b border-gold/10"><td className="py-3 pr-3"><div className="flex items-center gap-2"><Image src={row.image || '/nandinilogo.jpeg'} alt="" width={40} height={40} className="h-10 w-10 rounded-lg border border-gold/15 object-cover" /><span className="font-semibold text-charcoal">{row.name}</span></div></td><td>{row.category || '—'}</td><td>{row.unitsSold}</td><td>{formatCurrency(row.revenue)}</td></tr>)}</tbody></ResponsiveTable> : <p className="mt-5 text-sm text-charcoal/60">No sales in this period</p>}
            </div>

            <div className="rounded-[1.25rem] border border-gold/15 bg-white p-4 shadow-soft">
              <h2 className="font-fraunces text-xl text-charcoal">Slowest movers</h2>
              {data.tables.slowMovers.length ? <ResponsiveTable label="Slowest moving products"><thead><tr className="border-b border-gold/15 text-xs uppercase tracking-wider text-charcoal/55"><th className="py-2">Product</th><th>Stock</th><th>Units</th></tr></thead><tbody>{data.tables.slowMovers.map((row) => <tr key={row._id} className="border-b border-gold/10"><td className="py-3 font-semibold text-charcoal">{row.name}</td><td>{row.stock}</td><td>{row.unitsSold}</td></tr>)}</tbody></ResponsiveTable> : <p className="mt-5 text-sm text-charcoal/60">No in-stock products sold in this period</p>}
            </div>

            <div className="rounded-[1.25rem] border border-gold/15 bg-white p-4 shadow-soft">
              <h2 className="font-fraunces text-xl text-charcoal">Low stock</h2>
              {data.tables.lowStock.length ? <ResponsiveTable label="Low stock products"><thead><tr className="border-b border-gold/15 text-xs uppercase tracking-wider text-charcoal/55"><th className="py-2">Product</th><th>Category</th><th>Stock</th></tr></thead><tbody>{data.tables.lowStock.map((row) => <tr key={row._id} className="border-b border-gold/10"><td className="py-3 font-semibold text-charcoal">{row.name}</td><td>{row.category}</td><td className="font-semibold text-maroon">{row.stock}</td></tr>)}</tbody></ResponsiveTable> : <p className="mt-5 text-sm text-charcoal/60">No low-stock products</p>}
            </div>

            <div className="rounded-[1.25rem] border border-gold/15 bg-white p-4 shadow-soft">
              <h2 className="font-fraunces text-xl text-charcoal">Recent orders</h2>
              {data.tables.recentOrders.length ? <ResponsiveTable label="Recent orders"><thead><tr className="border-b border-gold/15 text-xs uppercase tracking-wider text-charcoal/55"><th className="py-2">Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Date</th></tr></thead><tbody>{data.tables.recentOrders.map((row) => <tr key={row._id} className="border-b border-gold/10"><td className="py-3 font-semibold text-charcoal">{row.orderNumber}</td><td>{row.customer}</td><td className="capitalize">{row.orderStatus?.replaceAll('_', ' ')}</td><td>{formatCurrency(row.totalAmount)}</td><td>{formatDate(row.createdAt)}</td></tr>)}</tbody></ResponsiveTable> : <p className="mt-5 text-sm text-charcoal/60">No orders in this period</p>}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
