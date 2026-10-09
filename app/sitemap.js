import connectToDatabase from '@/lib/mongodb';
import { CATEGORY_DEFS } from '@/lib/categoryMap';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const staticPaths = ['/about', '/contact', '/shipping', '/returns', '/faq', '/collections'];

function staticEntries() {
  const lastModified = new Date();
  return [
    { url: siteUrl, lastModified, changeFrequency: 'daily', priority: 1 },
    ...staticPaths.map((path) => ({ url: `${siteUrl}${path}`, lastModified, changeFrequency: 'monthly', priority: 0.5 })),
    ...CATEGORY_DEFS.map((category) => ({
      url: `${siteUrl}/category/${category.slug}`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    })),
  ];
}

export default async function sitemap() {
  try {
    await connectToDatabase();
    const products = await Product.find({}).select('slug updatedAt').lean();
    return [
      ...staticEntries(),
      ...products.map((product) => ({
        url: `${siteUrl}/product/${product.slug}`,
        lastModified: product.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })),
    ];
  } catch (error) {
    console.error('Sitemap database lookup failed; using static routes.', error);
    return staticEntries();
  }
}
