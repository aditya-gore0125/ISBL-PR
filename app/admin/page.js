import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export default async function AdminDashboardPage() {
  await connectToDatabase();

  const [orders, products] = await Promise.all([
    Order.find({}).sort({ createdAt: -1 }).lean(),
    Product.find({}).sort({ stock: 1, name: 1 }).lean(),
  ]);

  const paidOrders = orders.filter((order) => order.paymentStatus === 'paid');
  const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

  const statusCounts = {
    pending: 0,
    confirmed: 0,
    packed: 0,
    shipped: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
  };

  orders.forEach((order) => {
    const key = order.orderStatus || 'pending';
    if (statusCounts[key] !== undefined) {
      statusCounts[key] += 1;
    }
  });

  const lowStockList = products
    .filter((product) => Number(product.stock || 0) < 5)
    .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))
    .slice(0, 8);

  const stats = [
    { label: 'Total orders', value: orders.length },
    { label: 'Paid revenue', value: formatPrice(totalRevenue) },
    { label: 'Low stock', value: lowStockList.length },
    { label: 'Products', value: products.length },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[1.25rem] border border-gold/15 bg-white p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-charcoal/60">{stat.label}</p>
            <p className="mt-3 font-fraunces text-3xl text-charcoal">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.5rem] border border-gold/15 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-fraunces text-2xl text-charcoal">Orders by status</h2>
            <span className="rounded-full bg-gold/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
              Live
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-[1rem] border border-gold/10 bg-ivory px-4 py-3">
                <span className="text-sm font-medium capitalize text-charcoal/80">{status.replace('_', ' ')}</span>
                <span className="rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-charcoal">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-gold/15 bg-white p-5 shadow-soft">
          <h2 className="font-fraunces text-2xl text-charcoal">Low stock alert</h2>

          <div className="mt-4 space-y-3">
            {lowStockList.length ? (
              lowStockList.map((product) => (
                <div key={product._id.toString()} className="flex items-center justify-between rounded-[1rem] border border-maroon/15 bg-maroon/5 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-charcoal">{product.name}</p>
                    <p className="text-xs text-charcoal/60">{product.category}</p>
                  </div>
                  <span className="rounded-full bg-maroon/10 px-2 py-1 text-sm font-semibold text-maroon">{product.stock} left</span>
                </div>
              ))
            ) : (
              <p className="rounded-[1rem] border border-gold/10 bg-ivory px-3 py-4 text-sm text-charcoal/70">
                No products are under the low-stock threshold.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
