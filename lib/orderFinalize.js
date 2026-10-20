import Order from '@/models/Order';
import Product from '@/models/Product';

export async function decrementOrderStock(items) {
  const decrementedItems = [];

  const rollbackStock = async () => {
    let restored = true;
    for (const item of [...decrementedItems].reverse()) {
      const filter = item.size
        ? { _id: item.product, sizes: { $elemMatch: { size: item.size } } }
        : { _id: item.product };
      const update = item.size
        ? { $inc: { 'sizes.$.stock': item.quantity, stock: item.quantity } }
        : { $inc: { stock: item.quantity } };
      try {
        const result = await Product.updateOne(filter, update);
        if (result.modifiedCount === 1) continue;
        console.error('Order stock rollback could not restore product stock', {
          product: item.product?.toString(),
          size: item.size,
        });
        restored = false;
      } catch (error) {
        console.error('Order stock rollback failed', error);
        restored = false;
      }
    }
    return restored;
  };

  for (const item of items) {
    const filter = item.size
      ? {
          _id: item.product,
          'sizes.size': item.size,
          'sizes.stock': { $gte: item.quantity },
          sizes: { $elemMatch: { size: item.size, stock: { $gte: item.quantity } } },
        }
      : { _id: item.product, stock: { $gte: item.quantity } };
    const update = item.size
      ? { $inc: { 'sizes.$.stock': -item.quantity, stock: -item.quantity } }
      : { $inc: { stock: -item.quantity } };

    let result;
    try {
      result = await Product.updateOne(filter, update);
    } catch {
      await rollbackStock();
      return { success: false, decremented: false };
    }
    if (result.modifiedCount !== 1) {
      await rollbackStock();
      return { success: false, decremented: false };
    }
    decrementedItems.push(item);
  }

  return { success: true, decremented: true };
}

export async function finalizeOrderPayment({ order, paymentId, paidAmountPaise, shippingAddress }) {
  const expectedAmountPaise = Math.round(Number(order.totalAmount) * 100);

  // 1. Re-verify the paid amount equals the server-calculated order total
  if (paidAmountPaise !== undefined && paidAmountPaise !== null && Number(paidAmountPaise) !== expectedAmountPaise) {
    console.error('Order payment amount mismatch', {
      orderId: order._id?.toString(),
      razorpayOrderId: order.razorpayOrderId,
      paidAmountPaise,
      expectedAmountPaise,
    });
    const updated = await Order.findByIdAndUpdate(
      order._id,
      {
        $set: {
          needsReview: true,
          ...(paymentId ? { paymentId } : {}),
          ...(shippingAddress ? { shippingAddress } : {}),
        },
      },
      { new: true }
    );
    return { success: false, reason: 'amount_mismatch', order: updated, needsReview: true };
  }

  // 2. If already paid, return idempotently
  if (order.paymentStatus === 'paid') {
    if (shippingAddress && !order.shippingAddress) {
      const updated = await Order.findByIdAndUpdate(
        order._id,
        { $set: { shippingAddress } },
        { new: true }
      );
      return { success: true, order: updated, alreadyFinalized: true };
    }
    return { success: true, order, alreadyFinalized: true };
  }

  // 3. Atomic claim: transition paymentStatus from 'pending' to 'paid'
  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: 'pending' },
    {
      $set: {
        paymentStatus: 'paid',
        paymentId,
        ...(shippingAddress ? { shippingAddress } : {}),
      },
    },
    { new: true }
  );

  // If claimed is null, another process already transitioned paymentStatus
  if (!claimed) {
    const current = await Order.findById(order._id);
    return { success: true, order: current, alreadyFinalized: true };
  }

  // 4. Decrement stock exactly once for this claimed order
  const stockResult = await decrementOrderStock(claimed.items);
  if (!stockResult.success) {
    console.error('Paid order requires manual refund after stock decrement failure', {
      orderId: claimed._id.toString(),
      razorpayOrderId: claimed.razorpayOrderId,
    });
    const updated = await Order.findByIdAndUpdate(
      claimed._id,
      {
        $set: {
          orderStatus: 'pending',
          needsReview: true,
          stockRestored: true,
        },
      },
      { new: true }
    );
    return { success: false, reason: 'stock_failed', order: updated, needsReview: true };
  }

  // 5. Stock decremented successfully: mark order confirmed
  const confirmedOrder = await Order.findByIdAndUpdate(
    claimed._id,
    {
      $set: {
        orderStatus: 'confirmed',
        needsReview: false,
      },
    },
    { new: true }
  );

  return { success: true, order: confirmedOrder, alreadyFinalized: false };
}
