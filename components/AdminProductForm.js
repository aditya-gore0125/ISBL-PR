'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const CATEGORIES = [
  'Necklaces',
  'Earrings',
  'Rings',
  'Bangles & Bracelets',
  'Mangalsutra',
  'Anklets',
  'Nose Pins',
  'Combos & Sets',
];

const emptyProduct = {
  name: '',
  slug: '',
  category: 'Necklaces',
  description: '',
  material: '',
  price: '',
  discountPrice: '',
  images: '',
  stock: 0,
  isFeatured: false,
  isNewArrival: false,
  metaTitle: '',
  metaDescription: '',
};

export default function AdminProductForm({ productId }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyProduct);
  const [loading, setLoading] = useState(Boolean(productId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${productId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load product details.');
        }

        const product = data.product || {};
        setForm({
          name: product.name || '',
          slug: product.slug || '',
          category: product.category || 'Necklaces',
          description: product.description || '',
          material: product.material || '',
          price: product.price ?? '',
          discountPrice: product.discountPrice ?? '',
          images: Array.isArray(product.images) ? product.images.join('\n') : '',
          stock: product.stock ?? 0,
          isFeatured: Boolean(product.isFeatured),
          isNewArrival: Boolean(product.isNewArrival),
          metaTitle: product.metaTitle || '',
          metaDescription: product.metaDescription || '',
        });
      } catch (err) {
        setError(err.message || 'Error loading product.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setForm((prev) => ({
      ...prev,
      name: newName,
      slug: !productId && !prev.slug
        ? newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : prev.slug,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const imagesArray = form.images
        ? form.images
            .split(/[\n,]/)
            .map((url) => url.trim())
            .filter(Boolean)
        : [];

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: form.category,
        description: form.description.trim(),
        material: form.material.trim(),
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        images: imagesArray,
        stock: Number(form.stock || 0),
        isFeatured: Boolean(form.isFeatured),
        isNewArrival: Boolean(form.isNewArrival),
        metaTitle: form.metaTitle.trim(),
        metaDescription: form.metaDescription.trim(),
      };

      const endpoint = productId ? `/api/admin/products/${productId}` : '/api/admin/products';
      const method = productId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to save product.');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-[1.5rem] border border-gold/15 bg-white p-8 shadow-soft text-charcoal/70">
        Loading product information...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Catalog</p>
          <h2 className="mt-2 font-fraunces text-3xl text-charcoal">
            {productId ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>
        <Link
          href="/admin/products"
          className="rounded-full border border-gold/30 px-5 py-2.5 text-sm font-semibold text-charcoal hover:bg-ivory"
        >
          Cancel
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-[1.5rem] border border-gold/15 bg-white p-8 shadow-soft">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-charcoal">Product Name *</label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleNameChange}
              placeholder="e.g. Royal Kundan Choker"
              className="mt-2 w-full rounded-xl border border-gold/20 px-4 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal">Slug *</label>
            <input
              type="text"
              name="slug"
              required
              value={form.slug}
              onChange={handleChange}
              placeholder="royal-kundan-choker"
              className="mt-2 w-full rounded-xl border border-gold/20 px-4 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal">Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-gold/20 px-4 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal">Material</label>
            <input
              type="text"
              name="material"
              value={form.material}
              onChange={handleChange}
              placeholder="e.g. 22K Gold Plated Brass"
              className="mt-2 w-full rounded-xl border border-gold/20 px-4 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal">Price (₹) *</label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="1"
              value={form.price}
              onChange={handleChange}
              placeholder="2999"
              className="mt-2 w-full rounded-xl border border-gold/20 px-4 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal">Discount Price (₹)</label>
            <input
              type="number"
              name="discountPrice"
              min="0"
              step="1"
              value={form.discountPrice}
              onChange={handleChange}
              placeholder="2499 (optional)"
              className="mt-2 w-full rounded-xl border border-gold/20 px-4 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal">Stock Quantity</label>
            <input
              type="number"
              name="stock"
              min="0"
              value={form.stock}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-gold/20 px-4 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-6 pt-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-charcoal">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gold/30 text-gold focus:ring-gold"
              />
              Featured Product
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-charcoal">
              <input
                type="checkbox"
                name="isNewArrival"
                checked={form.isNewArrival}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gold/30 text-gold focus:ring-gold"
              />
              New Arrival
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal">Description</label>
          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            placeholder="Detailed description of the piece, craftsmanship, and styling notes..."
            className="mt-2 w-full rounded-xl border border-gold/20 px-4 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal">
            Image URLs (one URL per line or comma-separated)
          </label>
          <textarea
            name="images"
            rows={3}
            value={form.images}
            onChange={handleChange}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            className="mt-2 w-full rounded-xl border border-gold/20 px-4 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-charcoal">SEO Meta Title</label>
            <input
              type="text"
              name="metaTitle"
              value={form.metaTitle}
              onChange={handleChange}
              placeholder="e.g. Royal Kundan Choker | Nandini Jewellers"
              className="mt-2 w-full rounded-xl border border-gold/20 px-4 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal">SEO Meta Description</label>
            <input
              type="text"
              name="metaDescription"
              value={form.metaDescription}
              onChange={handleChange}
              placeholder="Brief description for search engine results..."
              className="mt-2 w-full rounded-xl border border-gold/20 px-4 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-gold/10 pt-6">
          <Link
            href="/admin/products"
            className="rounded-full border border-gold/30 px-6 py-2.5 text-sm font-semibold text-charcoal hover:bg-ivory"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-gold px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-gold-dark disabled:opacity-50"
          >
            {saving ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

