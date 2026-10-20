export const CATEGORY_DEFS = [
  { name: 'Earrings', slug: 'earrings', type: 'Ladies' },
  { name: 'Mangalsutra Pendant', slug: 'mangalsutra-pendant', type: 'Ladies' },
  { name: 'Mangalsutra Chain', slug: 'mangalsutra-chain', type: 'Ladies' },
  { name: 'Mangalsutra Set', slug: 'mangalsutra-set', type: 'Ladies' },
  { name: 'Necklace', slug: 'necklace', type: 'Ladies' },
  { name: 'Bangles', slug: 'bangles', type: 'Ladies' },
  { name: 'Rings', slug: 'rings', type: 'Ladies' },
  { name: 'Bracelet', slug: 'bracelet', type: 'Ladies' },
  { name: 'Chains', slug: 'chains', type: 'Ladies' },
  { name: 'Nath', slug: 'nath', type: 'Ladies' },
  { name: 'Hair Accessories', slug: 'hair-accessories', type: 'Ladies' },
  { name: 'Others', slug: 'others', type: 'Ladies' },
  { name: 'Chain', slug: 'chain', type: 'Gents' },
  { name: 'Bracelet', slug: 'bracelet-gents', type: 'Gents' },
  { name: 'Kada', slug: 'kada', type: 'Gents' },
  { name: 'Rings', slug: 'rings-gents', type: 'Gents' },
  { name: 'Earring', slug: 'earring-gents', type: 'Gents' },
  { name: 'Others', slug: 'others-gents', type: 'Gents' },
];

export function getCategoryBySlug(slug) {
  return CATEGORY_DEFS.find((category) => category.slug === slug) || null;
}