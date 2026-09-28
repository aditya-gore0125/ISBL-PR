import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap() {
  await connectToDatabase();
  const [categories, products] = await Promise.all([
    Category.find({}).select('slug updatedAt').lean(),
    Product.find({}).select('slug updatedAt').lean(),
  ]);

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...categories.map((category) => ({
      url: `${siteUrl}/category/${category.slug}`,
      lastModified: category.updatedAt || new Date(),
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
