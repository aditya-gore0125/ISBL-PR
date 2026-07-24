import mongoose from 'mongoose';

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
      enum: [
        'Necklaces',
        'Earrings',
        'Rings',
        'Bangles & Bracelets',
        'Mangalsutra',
        'Anklets',
        'Nose Pins',
        'Combos & Sets',
      ],
    },
    description: { type: String },
    material: { type: String },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    images: [{ type: String }],
    stock: { type: Number, default: 0 },
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

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
