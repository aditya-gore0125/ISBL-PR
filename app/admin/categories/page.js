'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { slugify } from '@/lib/slugify';

const categoryTypes = ['Ladies', 'Gents'];

const emptyCategory = {
  name: '',
  slug: '',
  image: '',
  type: 'Ladies',
  displayOrder: 0,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyCategory);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [expandedProducts, setExpandedProducts] = useState({});
  const imageFileInputRef = useRef(null);

  const handleToggleProducts = async (category) => {
    if (expandedCategoryId === category._id) {
      setExpandedCategoryId(null);
      return;
    }

    setExpandedCategoryId(category._id);

    if (!expandedProducts[category._id]?.products) {
      setExpandedProducts((prev) => ({
        ...prev,
        [category._id]: { loading: true, products: [], error: '' },
      }));

      try {
        const response = await fetch(`/api/admin/categories/${category._id}/products`);
        const data = await response.json();
        if (!response.ok) throw new Error(data?.message || 'Unable to load products.');
        setExpandedProducts((prev) => ({
          ...prev,
          [category._id]: { loading: false, products: data.products || [], error: '' },
        }));
      } catch (error) {
        console.error(error);
        setExpandedProducts((prev) => ({
          ...prev,
          [category._id]: { loading: false, products: [], error: error.message || 'Unable to load products.' },
        }));
      }
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Unable to load categories.');
      setCategories(data.categories || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        slug: slugify(form.slug || form.name),
        image: form.image.trim(),
        type: form.type,
        displayOrder: Number(form.displayOrder || 0),
      };

      const response = await fetch(editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Unable to save category.');
      }

      setForm(emptyCategory);
      setEditingId(null);
      setFormOpen(false);
      await loadCategories();
    } catch (error) {
      console.error(error);
      alert(error.message || 'Unable to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setUploadError('');
    setEditingId(category._id);
    setForm({
      name: category.name,
      slug: category.slug,
      image: category.image || '',
      type: category.type || 'Ladies',
      displayOrder: category.displayOrder || 0,
    });
    setFormOpen(true);
  };

  const handleCancel = () => {
    setUploadError('');
    setEditingId(null);
    setForm(emptyCategory);
    setFormOpen(false);
  };

  const handleDelete = async (categoryId) => {
    const confirmed = window.confirm('Delete this category?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Unable to delete category.');
      setCategories((current) => current.filter((category) => category._id !== categoryId));
    } catch (error) {
      console.error(error);
      alert(error.message || 'Unable to delete category.');
    }
  };

  const handleImageUpload = async (event) => {
    const image = event.target.files?.[0];
    event.target.value = '';
    if (!image) return;

    setImageUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('image', image);
      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Unable to upload image.');
      setForm((current) => ({ ...current, image: data.secure_url }));
    } catch (error) {
      setUploadError(error.message || 'Unable to upload image.');
    } finally {
      setImageUploading(false);
    }
  };

  const filteredCategories = categories.filter((category) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      category.name?.toLowerCase().includes(q) ||
      category.slug?.toLowerCase().includes(q) ||
      category.type?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Sticky header: Title + Search + Mobile Toggle + Form */}
      <div className="sticky top-0 z-20 space-y-4 bg-ivory/95 pb-4 pt-1 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Catalog</p>
            <h2 className="mt-2 font-fraunces text-3xl text-charcoal">Categories</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1 sm:w-64 sm:flex-none">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search categories..."
                aria-label="Search categories"
                className="h-11 w-full rounded-full border border-gold/20 bg-white px-4 text-sm text-charcoal outline-none placeholder:text-charcoal/40 focus:border-gold"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-charcoal/50 hover:text-charcoal"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                if (formOpen && editingId) {
                  handleCancel();
                } else {
                  setFormOpen((prev) => !prev);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-charcoal transition hover:bg-gold/20 sm:hidden"
            >
              <span>{formOpen ? (editingId ? 'Cancel Edit' : 'Hide Form') : editingId ? 'Edit Category' : '+ Add Category'}</span>
              <span>{formOpen ? '▴' : '▾'}</span>
            </button>
          </div>
        </div>

        {/* Categories form: collapsible on mobile, always visible on sm+ */}
        <form onSubmit={handleSubmit} className={`${formOpen ? 'block' : 'hidden'} sm:block rounded-[1.5rem] border border-gold/15 bg-white p-5 shadow-soft`}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="block xl:col-span-2">
              <span className="mb-2 block text-sm font-medium text-charcoal/80">Name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="h-12 w-full rounded-[1rem] border border-gold/20 bg-ivory px-4 text-sm text-charcoal outline-none focus:border-gold"
                placeholder="Necklaces"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-charcoal/80">Slug</span>
              <input
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                className="h-12 w-full rounded-[1rem] border border-gold/20 bg-ivory px-4 text-sm text-charcoal outline-none focus:border-gold"
                placeholder="necklaces"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-charcoal/80">Type</span>
              <select
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                className="h-12 w-full rounded-[1rem] border border-gold/20 bg-ivory px-4 text-sm text-charcoal outline-none focus:border-gold"
              >
                {categoryTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-charcoal/80">Display order</span>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(event) => setForm((current) => ({ ...current, displayOrder: event.target.value }))}
                className="h-12 w-full rounded-[1rem] border border-gold/20 bg-ivory px-4 text-sm text-charcoal outline-none focus:border-gold"
              />
            </label>
            <div className="flex flex-col gap-3 xl:col-span-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="block flex-1">
                  <span className="mb-2 block text-sm font-medium text-charcoal/80">Image URL</span>
                  <input
                    value={form.image}
                    onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
                    className="h-12 w-full rounded-[1rem] border border-gold/20 bg-ivory px-4 text-sm text-charcoal outline-none focus:border-gold"
                    placeholder="https://example.com/category.jpg"
                  />
                </label>
                <input ref={imageFileInputRef} type="file" accept="image/*" onChange={handleImageUpload} aria-label="Upload category image" className="sr-only" />
                <button type="button" disabled={imageUploading} onClick={() => imageFileInputRef.current?.click()} className="h-12 rounded-full border border-gold/25 bg-gold/5 px-5 text-sm font-semibold text-charcoal transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-60">
                  {imageUploading ? 'Uploading...' : 'Upload image'}
                </button>
              </div>
              {uploadError ? <p className="text-xs text-maroon">{uploadError}</p> : null}
              {form.image ? (
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-16 w-16 overflow-hidden rounded-lg border border-gold/20 bg-ivory">
                    <SafeImage src={form.image} alt="Category preview" width={64} height={64} sizes="64px" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="max-w-xs truncate text-xs text-charcoal/70">{form.image}</span>
                    <button
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, image: '' }))}
                      className="text-left text-xs text-maroon hover:underline"
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            {editingId && (
              <button type="button" onClick={handleCancel} className="rounded-full border border-gold/25 bg-ivory px-5 py-3 text-sm font-semibold text-charcoal transition hover:bg-white">
                Cancel
              </button>
            )}
            <button type="submit" disabled={saving || imageUploading} className="rounded-full bg-gold px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-70">
              {saving ? 'Saving...' : imageUploading ? 'Uploading image...' : editingId ? 'Update category' : 'Add category'}
            </button>
          </div>
        </form>
      </div>

      {/* Only the list scrolls */}
      <div className="overflow-hidden rounded-[1.5rem] border border-gold/15 bg-white shadow-soft">
        <div className="max-h-[calc(100vh-18rem)] min-h-[300px] overflow-auto">
          {loading ? (
            <div className="p-6 text-sm text-charcoal/70">Loading categories…</div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-ivory text-charcoal/70 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold">Image</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Slug</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Products</th>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length ? (
                  filteredCategories.map((category) => (
                    <Fragment key={category._id}>
                      <tr className="border-t border-gold/10 align-middle">
                        <td className="px-4 py-3">
                          {category.image ? (
                            <SafeImage src={category.image} alt={category.name} width={48} height={48} sizes="48px" className="h-12 w-12 rounded-lg object-cover" />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ivory text-[10px] uppercase tracking-[0.2em] text-charcoal/50">No image</div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-charcoal">{category.name}</td>
                        <td className="px-4 py-3 text-charcoal/70">{category.slug}</td>
                        <td className="px-4 py-3 text-charcoal/70">{category.type}</td>
                        <td className="px-4 py-3 text-charcoal">
                          <span className="inline-flex items-center rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-charcoal">
                            {category.productCount ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-charcoal/80">{category.displayOrder}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-1.5 min-w-[210px]">
                            <button
                              type="button"
                              onClick={() => handleToggleProducts(category)}
                              className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-charcoal transition hover:bg-gold/20"
                            >
                              {expandedCategoryId === category._id ? 'Hide products' : 'View products'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(category)}
                              className="rounded-full border border-gold/25 bg-gold/5 px-3 py-1.5 text-xs font-semibold text-charcoal hover:bg-gold/10"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(category._id)}
                              className="rounded-full border border-maroon/20 bg-maroon/5 px-3 py-1.5 text-xs font-semibold text-maroon hover:bg-maroon/10"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedCategoryId === category._id ? (
                        <tr className="bg-ivory/50">
                          <td colSpan={7} className="p-3 sm:p-5">
                            <div className="rounded-[1.25rem] border border-gold/20 bg-white p-4 shadow-sm sm:p-5">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-gold/15 pb-3">
                                <div>
                                  <h3 className="font-fraunces text-lg text-charcoal">
                                    Products in {category.name} ({category.type})
                                  </h3>
                                  <p className="text-xs text-charcoal/60">
                                    Matching rule: category === &quot;{category.name}&quot; &amp; type === &quot;{category.type}&quot;
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setExpandedCategoryId(null)}
                                  className="self-start rounded-full border border-gold/20 px-3 py-1 text-xs font-semibold text-charcoal/70 hover:bg-ivory hover:text-charcoal sm:self-auto"
                                >
                                  ✕ Close
                                </button>
                              </div>

                              <div className="py-4">
                                {expandedProducts[category._id]?.loading ? (
                                  <div className="py-8 text-center text-sm text-charcoal/60">Loading products…</div>
                                ) : expandedProducts[category._id]?.error ? (
                                  <div className="py-4 text-center text-sm text-maroon">{expandedProducts[category._id].error}</div>
                                ) : expandedProducts[category._id]?.products?.length ? (
                                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {expandedProducts[category._id].products.map((prod) => (
                                      <div
                                        key={prod._id}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-gold/15 bg-ivory/40 p-3"
                                      >
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gold/15 bg-white">
                                            <SafeImage
                                              src={prod.images?.[0] || '/category-placeholder.svg'}
                                              alt={prod.name}
                                              width={48}
                                              height={48}
                                              sizes="48px"
                                              className="h-full w-full object-cover"
                                            />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold text-charcoal">{prod.name}</p>
                                            <p className="mt-0.5 text-[11px] text-charcoal/70">
                                              ₹{prod.discountPrice || prod.price} · <span className={prod.stock > 0 ? 'text-charcoal/70' : 'font-semibold text-maroon'}>{prod.stock} in stock</span>
                                            </p>
                                          </div>
                                        </div>
                                        <Link
                                          href={`/admin/products/${prod._id}/edit`}
                                          className="shrink-0 rounded-full border border-gold/25 bg-white px-3 py-1 text-xs font-semibold text-charcoal hover:bg-gold/10"
                                        >
                                          Edit
                                        </Link>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="rounded-xl border border-dashed border-gold/30 bg-ivory/30 p-6 text-center">
                                    <p className="text-sm text-charcoal/70">No products in this category yet</p>
                                    <Link
                                      href="/admin/products/new"
                                      className="mt-3 inline-flex items-center gap-1 rounded-full bg-gold px-4 py-2 text-xs font-semibold text-white transition hover:bg-gold-dark"
                                    >
                                      + Add product
                                    </Link>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gold/15 pt-3">
                                <a
                                  href={`/category/${category.slug}?type=${encodeURIComponent(category.type)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-gold-dark hover:underline"
                                >
                                  Open storefront page ↗
                                </a>
                                <span className="text-xs text-charcoal/50">
                                  {expandedProducts[category._id]?.products?.length ?? category.productCount ?? 0} products
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-charcoal/60">
                      {categories.length === 0 ? 'No categories yet.' : 'No categories match your search.'}
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
