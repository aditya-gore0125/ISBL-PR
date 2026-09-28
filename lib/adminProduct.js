import { PRODUCT_CATEGORIES_BY_TYPE, PRODUCT_TYPES } from '@/lib/productOptions';

const PRODUCT_FIELDS = [
  'name',
  'slug',
  'type',
  'category',
  'description',
  'material',
  'price',
  'discountPrice',
  'images',
  'stock',
  'isFeatured',
  'isNewArrival',
  'rating',
  'numReviews',
  'reviews',
  'metaTitle',
  'metaDescription',
];

function numberValue(value, fallback = 0) {
  if (value === '' || value === null || value === undefined) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
}

export function normalizeProductPayload(body = {}, { partial = false } = {}) {
  const payload = {};

  PRODUCT_FIELDS.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) payload[field] = body[field];
  });

  ['name', 'slug', 'type', 'category', 'description', 'material', 'metaTitle', 'metaDescription'].forEach((field) => {
    if (field in payload && typeof payload[field] === 'string') payload[field] = payload[field].trim();
  });

  if ('price' in payload) payload.price = numberValue(payload.price, NaN);
  if ('discountPrice' in payload) payload.discountPrice = numberValue(payload.discountPrice);
  if ('stock' in payload) payload.stock = numberValue(payload.stock);
  if ('rating' in payload) payload.rating = numberValue(payload.rating);
  if ('numReviews' in payload) payload.numReviews = numberValue(payload.numReviews);

  if ('images' in payload) {
    payload.images = Array.isArray(payload.images)
      ? payload.images.filter((image) => typeof image === 'string' && image.trim()).map((image) => image.trim())
      : [];
  }

  if ('reviews' in payload && typeof payload.reviews === 'string') {
    try {
      payload.reviews = JSON.parse(payload.reviews);
    } catch {
      payload.reviews = [];
    }
  }

  if ('isFeatured' in payload) payload.isFeatured = Boolean(payload.isFeatured);
  if ('isNewArrival' in payload) payload.isNewArrival = Boolean(payload.isNewArrival);

  if (!partial) {
    ['name', 'slug', 'type', 'category'].forEach((field) => {
      if (!payload[field]) throw new Error(`${field} is required.`);
    });
  }

  if (payload.type && !PRODUCT_TYPES.includes(payload.type)) {
    throw new Error('Product type is invalid.');
  }

  if (payload.category) {
    const validCategories = payload.type
      ? PRODUCT_CATEGORIES_BY_TYPE[payload.type] || []
      : Object.values(PRODUCT_CATEGORIES_BY_TYPE).flat();
    if (!validCategories.includes(payload.category)) throw new Error('Product category is invalid.');
  }

  if ('price' in payload && !Number.isFinite(payload.price)) throw new Error('Price must be a number.');
  if ('discountPrice' in payload && !Number.isFinite(payload.discountPrice)) throw new Error('Discount price must be a number.');
  if ('stock' in payload && !Number.isFinite(payload.stock)) throw new Error('Stock must be a number.');
  if ('rating' in payload && (!Number.isFinite(payload.rating) || payload.rating < 0 || payload.rating > 5)) throw new Error('Rating must be between 0 and 5.');
  if ('numReviews' in payload && (!Number.isFinite(payload.numReviews) || payload.numReviews < 0)) throw new Error('Review count must be a positive number.');

  return payload;
}
