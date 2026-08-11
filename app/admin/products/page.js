'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to load products.');
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (productId) => {
    const confirmed = window.confirm('Delete this product?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Unable to delete product.');
      }
      setProducts((current) => current.filter((product) => product._id !== productId));
    } catch (error) {
      console.error(error);
      alert(error.message || 'Unable to delete product.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Catalog</p>
          <h2 className="mt-2 font-fraunces text-3xl text-charcoal">Products</h2>
        </div>
        <Link href="/admin/products/new" className="rounded-full bg-gold px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold-dark">
          + Add product
        </Link>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-gold/15 bg-white shadow-soft">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-charcoal/70">Loading products…</div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-ivory text-charcoal/70">
                <tr>
                  <th className="px-4 py-3 font-semibold">Image</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Featured</th>
                  <th className="px-4 py-3 font-semibold">New</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length ? (
                  products.map((product) => (
                    <tr key={product._id} className="border-t border-gold/10 align-middle">
                      <td className="px-4 py-3">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ivory text-[10px] uppercase tracking-[0.2em] text-charcoal/50">No image</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-charcoal">{product.name}</td>
                      <td className="px-4 py-3 text-charcoal/70">{product.category}</td>
                      <td className="px-4 py-3 text-charcoal/80">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3 text-charcoal/80">{product.stock}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${product.isFeatured ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {product.isFeatured ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${product.isNewArrival ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                          {product.isNewArrival ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link href={`/admin/products/${product._id}/edit`} className="rounded-full border border-gold/25 bg-gold/5 px-3 py-1.5 text-xs font-semibold text-charcoal hover:bg-gold/10">
                            Edit
                          </Link>
                          <button type="button" onClick={() => handleDelete(product._id)} className="rounded-full border border-maroon/20 bg-maroon/5 px-3 py-1.5 text-xs font-semibold text-maroon hover:bg-maroon/10">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-sm text-charcoal/60">
                      No products have been created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
