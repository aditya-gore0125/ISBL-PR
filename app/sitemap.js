import connectToDatabase from '@/lib/mongodb';
import { CATEGORY_DEFS } from '@/lib/categoryMap';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap() {
  await connectToDatabase();
  const products = await Product.find({}).select('slug updatedAt').lean();

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...CATEGORY_DEFS.map((category) => ({
      url: `${siteUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/product/${product.slug}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
  ];
}
