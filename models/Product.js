import mongoose from 'mongoose';
import { PRODUCT_CATEGORIES, PRODUCT_TYPES } from '../lib/productOptions.js';

const sizeStockSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: {
      type: String,
      required: true,
      enum: PRODUCT_CATEGORIES,
    },
    type: {
      type: String,
      required: true,
      enum: PRODUCT_TYPES,
    },
    description: { type: String },
    material: { type: String },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    images: [{ type: String }],
    stock: { type: Number, default: 0 },
    sizes: [sizeStockSchema],
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

productSchema.pre('save', function syncSizeStock(next) {
  if (this.sizes?.length) this.stock = this.sizes.reduce((total, size) => total + Number(size.stock || 0), 0);
  next();
});

productSchema.index({ name: 'text', description: 'text', category: 'text' });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
