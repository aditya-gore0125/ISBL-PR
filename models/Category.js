import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    type: { type: String, enum: ['Ladies', 'Gents'], default: 'Ladies' },
    image: { type: String },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: false }
);

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export default Category;
