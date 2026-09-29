import { cache } from 'react';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';

const fallbackCategories = [
  { name: 'Earrings', slug: 'earrings', type: 'Ladies', image: '/hero-placeholder.svg' },
  { name: 'Mangalsutra Pendant', slug: 'mangalsutra-pendant', type: 'Ladies', image: '/hero-placeholder.svg' },
  { name: 'Mangalsutra Chain', slug: 'mangalsutra-chain', type: 'Ladies', image: '/hero-placeholder.svg' },
  { name: 'Mangalsutra Set', slug: 'mangalsutra-set', type: 'Ladies', image: '/hero-placeholder.svg' },
  { name: 'Necklace', slug: 'necklace', type: 'Ladies', image: '/hero-placeholder.svg' },
  { name: 'Bangles', slug: 'bangles', type: 'Ladies', image: '/hero-placeholder.svg' },
  { name: 'Bracelet', slug: 'bracelet', type: 'Ladies', image: '/hero-placeholder.svg' },
  { name: 'Chains', slug: 'chains', type: 'Ladies', image: '/hero-placeholder.svg' },
  { name: 'Nath', slug: 'nath', type: 'Ladies', image: '/hero-placeholder.svg' },
  { name: 'Hair Accessories', slug: 'hair-accessories', type: 'Ladies', image: '/hero-placeholder.svg' },
  { name: 'Others', slug: 'others', type: 'Ladies', image: '/hero-placeholder.svg' },
  { name: 'Chain', slug: 'chain', type: 'Gents', image: '/hero-placeholder.svg' },
  { name: 'Bracelet', slug: 'bracelet-gents', type: 'Gents', image: '/hero-placeholder.svg' },
  { name: 'Kada', slug: 'kada', type: 'Gents', image: '/hero-placeholder.svg' },
  { name: 'Earring', slug: 'earring-gents', type: 'Gents', image: '/hero-placeholder.svg' },
  { name: 'Others', slug: 'others-gents', type: 'Gents', image: '/hero-placeholder.svg' },
];

export const getCategories = cache(async () => {
  await connectToDatabase();
  const categories = await Category.find({})
    .sort({ displayOrder: 1, name: 1 })
    .select('name slug type image -_id')
    .lean();

  if (!categories.length) return fallbackCategories;

  return categories.map((category) => ({
    name: String(category.name ?? ''),
    slug: String(category.slug ?? ''),
    type: String(category.type ?? 'Ladies'),
    image: String(category.image || '/hero-placeholder.svg'),
  }));
});