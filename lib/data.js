import { cache } from 'react';
import connectToDatabase from '@/lib/mongodb';
import { CATEGORY_DEFS } from '@/lib/categoryMap';
import Category from '@/models/Category';

export const getCategories = cache(async () => {
  try {
    await connectToDatabase();
    const categories = await Category.find({ slug: { $in: CATEGORY_DEFS.map(({ slug }) => slug) } })
      .select('slug image -_id')
      .lean();
    const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]));

    return CATEGORY_DEFS.map((category) => ({
      ...category,
      image: String(categoriesBySlug.get(category.slug)?.image || '/hero-placeholder.svg'),
    }));
  } catch (error) {
    console.error('Category lookup failed; using default categories.', error);
    return CATEGORY_DEFS.map((category) => ({
      ...category,
      image: '/hero-placeholder.svg',
    }));
  }
});