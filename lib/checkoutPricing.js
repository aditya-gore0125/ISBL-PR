import mongoose from 'mongoose';
import Product from '@/models/Product';

export class CheckoutCartError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function getCheckoutPricing(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    throw new CheckoutCartError('Your cart is empty or invalid.');
  }

  const quantities = new Map();
  for (const item of items) {
    const { productId: rawProductId, quantity } = item || {};
    if (!item || typeof item !== 'object' || Array.isArray(item)
      || Object.keys(item).some((key) => !['productId', 'quantity'].includes(key))
      || typeof rawProductId !== 'string' || !mongoose.isValidObjectId(rawProductId)
      || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new CheckoutCartError('Your cart contains an invalid item.');
    }

    const productId = new mongoose.Types.ObjectId(rawProductId).toString();
    quantities.set(productId, (quantities.get(productId) || 0) + quantity);
  }

  const products = await Product.find({ _id: { $in: [...quantities.keys()] } }).lean();
  const productsById = new Map(products.map((product) => [product._id.toString(), product]));
  const pricedItems = [];
  let subtotalPaise = 0;

  for (const [productId, quantity] of quantities) {
    const product = productsById.get(productId);
    if (!product) throw new CheckoutCartError('A product in your cart is no longer available.', 404);
    if (!Number.isFinite(Number(product.stock)) || quantity > Number(product.stock)) {
      throw new CheckoutCartError(`${product.name} does not have enough stock.`, 409);
    }

    const price = Number(product.price);
    const discountPrice = Number(product.discountPrice);
    const unitPrice = Number.isFinite(discountPrice) && discountPrice > 0 && discountPrice < price
      ? discountPrice
      : price;
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new CheckoutCartError(`${product.name} has an invalid price.`, 500);
    }

    const unitPricePaise = Math.round(unitPrice * 100);
    subtotalPaise += unitPricePaise * quantity;
    pricedItems.push({
      product: product._id,
      productId,
      name: product.name,
      image: product.images?.[0] || '/hero-placeholder.svg',
      price: unitPricePaise / 100,
      quantity,
    });
  }

  const shippingPaise = subtotalPaise >= 99900 ? 0 : 9900;
  const totalPaise = subtotalPaise + shippingPaise;

  return {
    items: pricedItems,
    subtotalPaise,
    shippingPaise,
    totalPaise,
    total: totalPaise / 100,
  };
}