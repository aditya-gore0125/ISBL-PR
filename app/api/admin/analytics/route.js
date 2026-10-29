import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { requireAdmin } from '@/lib/requireAdmin';
import Order from '@/models/Order';
import Product from '@/models/Product';

const TIME_ZONE = 'Asia/Kolkata';
const VALID_PERIODS = new Set(['monthly', 'quarterly', 'yearly']);
const SALES_MATCH = {
  paymentStatus: 'paid',
  orderStatus: { $nin: ['cancelled', 'returned'] },
};

function parseDateParam(value, endOfDay = false) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return date;
}

function getDefaultRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  return { from: start, to: now };
}

function periodIdExpression(period) {
  const year = { $year: { date: '$createdAt', timezone: TIME_ZONE } };
  const month = { $month: { date: '$createdAt', timezone: TIME_ZONE } };
  if (period === 'quarterly') return { year, quarter: { $ceil: { $divide: [month, 3] } } };
  if (period === 'yearly') return { year };
  return { year, month };
}

function periodLabel(period, id) {
  if (period === 'yearly') return String(id.year);
  if (period === 'quarterly') return `Q${id.quarter} ${id.year}`;
  const date = new Date(Date.UTC(id.year, id.month - 1, 1));
  return date.toLocaleString('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function periodSort(period, id) {
  if (period === 'yearly') return id.year;
  if (period === 'quarterly') return id.year * 10 + id.quarter;
  return id.year * 100 + id.month;
}

function percentageChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

async function getKpis(from, to) {
  const duration = to.getTime() - from.getTime();
  const previousTo = new Date(from.getTime());
  const previousFrom = new Date(previousTo.getTime() - duration);
  const buildPipeline = (start, end) => [
    { $match: { ...SALES_MATCH, createdAt: { $gte: start, $lte: end } } },
    { $group: {
      _id: null,
      revenue: { $sum: { $ifNull: ['$totalAmount', 0] } },
      orders: { $sum: 1 },
      units: {
        $sum: {
          $reduce: {
            input: { $ifNull: ['$items', []] },
            initialValue: 0,
            in: { $add: ['$$value', { $ifNull: ['$$this.quantity', 0] }] },
          },
        },
      },
      customers: { $addToSet: '$user' },
    } },
  ];

  const [currentRows, previousRows] = await Promise.all([
    Order.aggregate(buildPipeline(from, to)),
    Order.aggregate(buildPipeline(previousFrom, previousTo)),
  ]);
  const current = currentRows[0] || { revenue: 0, orders: 0, units: 0, customers: [] };
  const previous = previousRows[0] || { revenue: 0, orders: 0, units: 0, customers: [] };
  const averageOrderValue = current.orders ? current.revenue / current.orders : 0;
  const previousAverage = previous.orders ? previous.revenue / previous.orders : 0;

  return {
    current: { revenue: current.revenue, orders: current.orders, averageOrderValue, units: current.units, newCustomers: current.customers.length },
    changes: {
      revenue: percentageChange(current.revenue, previous.revenue),
      orders: percentageChange(current.orders, previous.orders),
      averageOrderValue: percentageChange(averageOrderValue, previousAverage),
      units: percentageChange(current.units, previous.units),
      newCustomers: percentageChange(current.customers.length, previous.customers.length),
    },
  };
}

export async function GET(request) {
  const auth = await requireAdmin();
  if (auth.response) {
    return NextResponse.json({ message: 'Admin access required.' }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const period = params.get('period') || 'monthly';
  const requestedFrom = parseDateParam(params.get('from'));
  const requestedTo = parseDateParam(params.get('to'), true);

  if (!VALID_PERIODS.has(period)) return NextResponse.json({ message: 'Invalid period.' }, { status: 400 });
  if ((params.has('from') && !requestedFrom) || (params.has('to') && !requestedTo)) {
    return NextResponse.json({ message: 'Use YYYY-MM-DD for from and to.' }, { status: 400 });
  }

  const defaults = getDefaultRange();
  const from = requestedFrom || defaults.from;
  const to = requestedTo || defaults.to;
  if (from > to) return NextResponse.json({ message: 'The from date must be before the to date.' }, { status: 400 });

  try {
    await connectToDatabase();
    const range = { $gte: from, $lte: to };
    const periodId = periodIdExpression(period);

    const [kpis, timeSeries, categorySales, orderStatuses, paymentStatuses, productSales, materialSales, slowMovers, lowStock, recentOrders] = await Promise.all([
      getKpis(from, to),
      Order.aggregate([
        { $match: { ...SALES_MATCH, createdAt: range } },
        { $group: { _id: periodId, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.quarter': 1 } },
      ]),
      Order.aggregate([
        { $match: { ...SALES_MATCH, createdAt: range } },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
        { $set: { category: { $ifNull: [{ $arrayElemAt: ['$product.category', 0] }, 'Uncategorized'] } } },
        { $group: { _id: '$category', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { revenue: -1 } },
      ]),
      Order.aggregate([
        { $match: { createdAt: range, $nor: [{ orderStatus: 'pending', paymentStatus: 'pending' }] } },
        { $group: { _id: { $ifNull: ['$orderStatus', 'pending'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Order.aggregate([
        { $match: { createdAt: range, $nor: [{ orderStatus: 'pending', paymentStatus: 'pending' }] } },
        { $group: { _id: { $ifNull: ['$paymentStatus', 'pending'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Order.aggregate([
        { $match: { ...SALES_MATCH, createdAt: range } },
        { $unwind: '$items' },
        { $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        } },
        { $sort: { unitsSold: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $set: { product: { $arrayElemAt: ['$product', 0] } } },
        { $project: { _id: 0, productId: { $toString: '$_id' }, name: 1, category: '$product.category', image: { $arrayElemAt: ['$product.images', 0] }, unitsSold: 1, revenue: 1 } },
      ]),
      Order.aggregate([
        { $match: { ...SALES_MATCH, createdAt: range } },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
        { $set: { material: { $ifNull: [{ $arrayElemAt: ['$product.material', 0] }, 'Unspecified'] } } },
        { $group: { _id: '$material', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { revenue: -1 } },
      ]),
      Order.aggregate([
        { $match: { ...SALES_MATCH, createdAt: range } },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
        { $set: { product: { $arrayElemAt: ['$product', 0] } } },
        { $match: { 'product.stock': { $gt: 0 } } },
        { $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          category: { $first: '$product.category' },
          image: { $first: { $arrayElemAt: ['$product.images', 0] } },
          stock: { $first: '$product.stock' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        } },
        { $sort: { unitsSold: 1, name: 1 } },
        { $limit: 10 },
      ]),
      Product.find({ stock: { $lt: 5, $gte: 0 } }).sort({ stock: 1, name: 1 }).limit(20).select('name category stock images').lean(),
      Order.find({ createdAt: range }).sort({ createdAt: -1 }).limit(10).populate('user', 'name email').lean(),
    ]);

    const timeSeriesData = timeSeries.map((row) => ({
      period: periodLabel(period, row._id),
      sort: periodSort(period, row._id),
      revenue: row.revenue,
      orders: row.orders,
    })).sort((a, b) => a.sort - b.sort);

    return NextResponse.json({
      period,
      range: { from: from.toISOString(), to: to.toISOString() },
      kpis: kpis.current,
      changes: kpis.changes,
      charts: {
        revenueOverTime: timeSeriesData,
        ordersOverTime: timeSeriesData,
        salesByCategory: categorySales.map((row) => ({ name: row._id, value: row.revenue })),
        orderStatuses: orderStatuses.map((row) => ({ name: row._id, value: row.count })),
        paymentStatuses: paymentStatuses.map((row) => ({ name: row._id, value: row.count })),
        topProducts: productSales.map((row) => ({ name: row.name, unitsSold: row.unitsSold })),
        revenueByMaterial: materialSales.map((row) => ({ name: row._id, value: row.revenue })),
      },
      tables: {
        topProducts: productSales,
        slowMovers,
        lowStock: lowStock.map((product) => ({ ...product, _id: product._id.toString(), image: product.images?.[0] || null })),
        recentOrders: recentOrders.map((order) => ({
          _id: order._id.toString(),
          orderNumber: `#${order._id.toString().slice(-8).toUpperCase()}`,
          customer: order.shippingAddress?.fullName || order.user?.name || 'Guest',
          email: order.user?.email || null,
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          createdAt: order.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Admin analytics error', error);
    return NextResponse.json({ message: 'Unable to load analytics.' }, { status: 500 });
  }
}
