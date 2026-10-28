import connectToDatabase from '@/lib/mongodb';
import { requireAdmin } from '@/lib/requireAdmin';
import { CATEGORY_DEFS } from '@/lib/categoryMap';
import Category from '@/models/Category';

const categoriesToSeed = CATEGORY_DEFS.map((category, displayOrder) => ({
  ...category,
  image: '/hero-placeholder.svg',
  displayOrder,
}));

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    return new Response(null, { status: 404 });
  }

  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectToDatabase();
    await Category.bulkWrite(
      categoriesToSeed.map((category) => ({
        updateOne: {
          filter: { slug: category.slug },
          update: { $set: category },
          upsert: true,
        },
      }))
    );

    return new Response(`Seeded ${categoriesToSeed.length} jewelry categories.`, { status: 201 });
  } catch (error) {
    console.error('Category seed failed', error);
    return Response.json({ message: 'Unable to seed sample categories.' }, { status: 500 });
  }
}

export const GET = seed;
export const POST = seed;