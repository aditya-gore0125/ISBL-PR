'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCT_CATEGORIES_BY_TYPE, PRODUCT_TYPES } from '@/lib/productOptions';
import { getSizeOptions } from '@/lib/sizeConfig';
import { slugify } from '@/lib/slugify';

const emptyProduct = {
  name: '', slug: '', type: 'Ladies', category: PRODUCT_CATEGORIES_BY_TYPE.Ladies[0], description: '', material: '',
  price: '', discountPrice: '', images: [], stock: 0, sizes: [], isFeatured: false, isNewArrival: false, rating: 0,
  numReviews: 0, reviews: [], metaTitle: '', metaDescription: '',
};

const inputClass = 'mt-2 w-full rounded-[0.8rem] border border-gold/20 bg-ivory px-3 py-2.5 text-sm font-normal text-charcoal outline-none focus:border-gold';
const labelClass = 'block text-sm font-semibold text-charcoal';

function productForm(product) {
  return {
    ...emptyProduct,
    ...product,
    images: Array.isArray(product?.images) ? product.images : [],
    sizes: Array.isArray(product?.sizes) ? product.sizes : [],
    reviews: Array.isArray(product?.reviews) ? product.reviews : [],
  };
}

export default function AdminProductForm({ productId }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyProduct);
  const [slugEdited, setSlugEdited] = useState(Boolean(productId));
  const [slugError, setSlugError] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/admin/products/${productId}`).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load this product.');
      setForm(productForm(data.product));
      setSlugEdited(true);
    }).catch((error) => setStatus(error.message));
  }, [productId]);

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    if (name === 'slug') {
      setSlugError('');
      setSlugEdited(Boolean(value));
    }
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'name' && !productId && !slugEdited ? { slug: slugify(value) } : {}),
    }));
  };

  const regenerateSlug = () => {
    if (!window.confirm('Changing the slug breaks old links to this product. Continue?')) return;
    setForm((current) => ({ ...current, slug: slugify(current.name) }));
    setSlugEdited(true);
    setSlugError('');
  };

  const changeType = (event) => {
    const type = event.target.value;
    const category = PRODUCT_CATEGORIES_BY_TYPE[type][0];
    const sizeOptions = getSizeOptions(type, category);
    setForm((current) => ({
      ...current,
      type,
      category,
      sizes: sizeOptions ? sizeOptions.map((size) => ({ size, stock: 0 })) : [],
    }));
  };

  const changeCategory = (event) => {
    const category = event.target.value;
    const sizeOptions = getSizeOptions(form.type, category);
    setForm((current) => ({
      ...current,
      category,
      sizes: sizeOptions ? sizeOptions.map((size) => ({ size, stock: 0 })) : [],
    }));
  };

  const updateImages = (event) => {
    const images = event.target.value.split('\n').map((image) => image.trim()).filter(Boolean);
    setForm((current) => ({ ...current, images }));
  };

  const uploadImage = async (event) => {
    const image = event.target.files?.[0];
    if (!image) return;
    setUploading(true);
    setStatus('');
    try {
      const body = new FormData();
      body.append('image', image);
      const response = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to upload image.');
      setForm((current) => ({ ...current, images: [...current.images, data.secure_url] }));
    } catch (error) {
      setStatus(error.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const normalizedSlug = slugify(form.slug);
    if (!normalizedSlug) {
      setSlugError('Slug is required.');
      setStatus('');
      return;
    }
    setForm((current) => ({ ...current, slug: normalizedSlug }));
    setSaving(true);
    setStatus('');
    setSlugError('');
    try {
      const payload = {
        name: form.name,
        slug: normalizedSlug,
        type: form.type,
        category: form.category,
        description: form.description,
        material: form.material,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice || 0),
        images: form.images,
        stock: Number(form.stock || 0),
        sizes: getSizeOptions(form.type, form.category)
          ? getSizeOptions(form.type, form.category).map((size) => ({
              size,
              stock: Number(form.sizes.find((entry) => entry.size === size)?.stock || 0),
            }))
          : [],
        isFeatured: form.isFeatured,
        isNewArrival: form.isNewArrival,
        rating: Number(form.rating || 0),
        numReviews: Number(form.numReviews || 0),
        reviews: form.reviews,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
      };
      const response = await fetch(productId ? `/api/admin/products/${productId}` : '/api/admin/products', { method: productId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setSlugError(data.error || 'A product with this slug already exists. Change the name or slug.');
          return;
        }
        throw new Error(data.message || 'Unable to save product.');
      }
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  };

  const sizeOptions = getSizeOptions(form.type, form.category);
  const updateName = (event) => {
    const name = event.target.value;
    if (!productId && !slugEdited) setSlugError('');
    setForm((current) => ({
      ...current,
      name,
      ...(!productId && !slugEdited ? { slug: slugify(name) } : {}),
    }));
  };
  const updateSlug = (event) => {
    const slug = event.target.value;
    setForm((current) => ({ ...current, slug }));
    setSlugEdited(Boolean(slug));
    setSlugError('');
  };
  const normalizeSlugOnBlur = () => {
    const slug = slugify(form.slug);
    setForm((current) => ({ ...current, slug }));
    setSlugEdited(Boolean(slug));
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-5xl space-y-6 rounded-[1.5rem] border border-gold/15 bg-white p-5 shadow-soft sm:p-7">
      <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Catalog</p><h2 className="mt-2 font-fraunces text-3xl text-charcoal">{productId ? 'Edit product' : 'New product'}</h2><p className="mt-2 text-sm text-charcoal/65">Manage the complete product record shown in your storefront.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className={labelClass}>Name<input required name="name" value={form.name} onChange={updateName} className={inputClass} /></label>
        <div className="min-w-0">
          <label className={labelClass}>Slug<input aria-required="true" aria-invalid={Boolean(slugError)} name="slug" value={form.slug} onChange={updateSlug} onBlur={normalizeSlugOnBlur} className={inputClass} /></label>
          <p className="mt-1 text-xs text-charcoal/55">Auto-generated from name. Edit to customize.</p>
          {productId ? <button type="button" onClick={regenerateSlug} className="mt-1 text-xs font-semibold text-gold-dark hover:text-gold">Regenerate from name</button> : null}
          <p className="mt-1 break-all text-xs text-charcoal/65">URL preview: /product/{slugify(form.slug)}</p>
          {slugError ? <p role="alert" aria-live="polite" className="mt-1 text-sm text-maroon">{slugError}</p> : null}
        </div>
        <label className={labelClass}>Material<input name="material" value={form.material} onChange={update} className={inputClass} /></label>
        <label className={labelClass}>Type<select name="type" value={form.type} onChange={changeType} className={inputClass}>{PRODUCT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
        <label className={labelClass}>Category<select required name="category" value={form.category} onChange={changeCategory} className={inputClass}>{PRODUCT_CATEGORIES_BY_TYPE[form.type].map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
        <label className={labelClass}>Price<input required min="0" name="price" type="number" value={form.price} onChange={update} className={inputClass} /></label>
        <label className={labelClass}>Discount price<input min="0" name="discountPrice" type="number" value={form.discountPrice} onChange={update} className={inputClass} /></label>
        {sizeOptions ? sizeOptions.map((size) => (
          <label key={size} className={labelClass}>Size {size} stock<input min="0" step="1" type="number" value={form.sizes.find((entry) => entry.size === size)?.stock ?? 0} onChange={(event) => setForm((current) => ({ ...current, sizes: current.sizes.map((entry) => entry.size === size ? { ...entry, stock: event.target.value } : entry) }))} className={inputClass} /></label>
        )) : <label className={labelClass}>Stock<input min="0" name="stock" type="number" value={form.stock} onChange={update} className={inputClass} /></label>}
        <label className={labelClass}>Rating<input min="0" max="5" step="0.1" name="rating" type="number" value={form.rating} onChange={update} className={inputClass} /></label>
        <label className={labelClass}>Review count<input min="0" name="numReviews" type="number" value={form.numReviews} onChange={update} className={inputClass} /></label>
      </div>
      <label className={labelClass}>Description<textarea required name="description" value={form.description} onChange={update} rows="5" className={inputClass} /></label>
      <div className="grid gap-4 lg:grid-cols-2"><label className={labelClass}>Meta title<input name="metaTitle" value={form.metaTitle} onChange={update} className={inputClass} /></label><label className={labelClass}>Meta description<textarea name="metaDescription" value={form.metaDescription} onChange={update} rows="3" className={inputClass} /></label></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className={labelClass}>Image URLs<textarea name="images" value={form.images.join('\n')} onChange={updateImages} rows="5" placeholder="One URL per line" className={inputClass} /></label>
        <div><label className={labelClass}>Upload image<input type="file" accept="image/*" onChange={uploadImage} disabled={uploading} className={`${inputClass} file:mr-3 file:rounded-full file:border-0 file:bg-gold file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white`} /></label><p className="mt-2 text-xs text-charcoal/55">{uploading ? 'Uploading image...' : `${form.images.length} image${form.images.length === 1 ? '' : 's'} attached`}</p></div>
      </div>
      <label className={labelClass}>Reviews JSON<textarea name="reviews" value={JSON.stringify(form.reviews, null, 2)} onChange={(event) => { try { setForm((current) => ({ ...current, reviews: JSON.parse(event.target.value) })); } catch {} }} rows="5" className={`${inputClass} font-mono text-xs`} /></label>
      <div className="flex flex-wrap gap-5 text-sm font-semibold text-charcoal"><label className="flex items-center gap-2"><input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={update} className="h-4 w-4 rounded border-gold/20 text-gold focus:ring-gold" />Featured</label><label className="flex items-center gap-2"><input type="checkbox" name="isNewArrival" checked={form.isNewArrival} onChange={update} className="h-4 w-4 rounded border-gold/20 text-gold focus:ring-gold" />New arrival</label></div>
      {status ? <p role="alert" aria-live="polite" className="text-sm text-maroon">{status}</p> : null}
      <div className="flex justify-end"><button type="submit" disabled={saving || uploading} className="rounded-[0.95rem] bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving...' : 'Save product'}</button></div>
    </form>
  );
}
