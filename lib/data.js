import { cache } from 'react';
import connectToDatabase from '@/lib/mongodb';
import { CATEGORY_DEFS } from '@/lib/categoryMap';
import Category from '@/models/Category';

export const getCategories = cache(async () => {
  try {
    await connectToDatabase();
    const dbCategories = await Category.find().sort({ displayOrder: 1, name: 1 }).lean();
    const categoriesBySlug = new Map(dbCategories.map((c) => [c.slug, c]));
    const categoriesByKey = new Map(dbCategories.map((c) => [`${c.name}__${c.type}`, c]));

    const categories = CATEGORY_DEFS.map((category) => {
      const match = categoriesBySlug.get(category.slug) || categoriesByKey.get(`${category.name}__${category.type}`);
      return {
        ...category,
        image: match?.image?.trim() || '/category-placeholder.svg',
      };
    });

    const defSlugs = new Set(CATEGORY_DEFS.map((c) => c.slug));
    dbCategories.forEach((c) => {
      if (!defSlugs.has(c.slug)) {
        categories.push({
          name: c.name,
          slug: c.slug,
          type: c.type || 'Ladies',
          image: c.image?.trim() || '/category-placeholder.svg',
          displayOrder: c.displayOrder || 0,
        });
      }
    });

    return categories;
  } catch (error) {
    console.error('Category lookup failed; using default categories.', error);
    return CATEGORY_DEFS.map((category) => ({
      ...category,
      image: '/category-placeholder.svg',
    }));
  }
});