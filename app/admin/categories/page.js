'use client';

import { useEffect, useState } from 'react';

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
  const [form, setForm] = useState(emptyCategory);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        slug: form.slug || form.name.trim(),
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
      await loadCategories();
    } catch (error) {
      console.error(error);
      alert(error.message || 'Unable to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setForm({
      name: category.name,
      slug: category.slug,
      image: category.image || '',
      type: category.type || 'Ladies',
      displayOrder: category.displayOrder || 0,
    });
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Catalog</p>
        <h2 className="mt-2 font-fraunces text-3xl text-charcoal">Categories</h2>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[1.5rem] border border-gold/15 bg-white p-5 shadow-soft">
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
          <label className="block xl:col-span-5">
            <span className="mb-2 block text-sm font-medium text-charcoal/80">Image URL</span>
            <input
              value={form.image}
              onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
              className="h-12 w-full rounded-[1rem] border border-gold/20 bg-ivory px-4 text-sm text-charcoal outline-none focus:border-gold"
              placeholder="https://example.com/category.jpg"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end">
          <button type="submit" disabled={saving} className="rounded-full bg-gold px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-70">
            {saving ? 'Saving...' : editingId ? 'Update category' : 'Add category'}
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-[1.5rem] border border-gold/15 bg-white shadow-soft">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-charcoal/70">Loading categories…</div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-ivory text-charcoal/70">
                <tr>
                  <th className="px-4 py-3 font-semibold">Image</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Slug</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length ? (
                  categories.map((category) => (
                    <tr key={category._id} className="border-t border-gold/10 align-middle">
                      <td className="px-4 py-3">
                        {category.image ? (
                          <img src={category.image} alt={category.name} className="h-12 w-12 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ivory text-[10px] uppercase tracking-[0.2em] text-charcoal/50">No image</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-charcoal">{category.name}</td>
                      <td className="px-4 py-3 text-charcoal/70">{category.slug}</td>
                      <td className="px-4 py-3 text-charcoal/70">{category.type}</td>
                      <td className="px-4 py-3 text-charcoal/80">{category.displayOrder}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleEdit(category)} className="rounded-full border border-gold/25 bg-gold/5 px-3 py-1.5 text-xs font-semibold text-charcoal hover:bg-gold/10">
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDelete(category._id)} className="rounded-full border border-maroon/20 bg-maroon/5 px-3 py-1.5 text-xs font-semibold text-maroon hover:bg-maroon/10">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-sm text-charcoal/60">
                      No categories yet.
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
