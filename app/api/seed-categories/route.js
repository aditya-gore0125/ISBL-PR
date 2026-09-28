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

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Category seed route is only available in development.', { status: 403 });
  }

  try {
    await connectToDatabase();
    const existingCount = await Category.countDocuments({ slug: { $in: fallbackCategories.map((category) => category.slug) } });

    if (existingCount === fallbackCategories.length) {
      return new Response('Sample categories already exist in the database.', { status: 200 });
    }

    await Category.bulkWrite(
      fallbackCategories.map((category) => ({
        updateOne: {
          filter: { slug: category.slug },
          update: { $set: category },
          upsert: true,
        },
      }))
    );

    return new Response(`Seeded ${fallbackCategories.length} jewelry categories.`, { status: 201 });
  } catch (error) {
    console.error('Category seed failed', error);
    return Response.json({ message: 'Unable to seed sample categories.' }, { status: 500 });
  }
}