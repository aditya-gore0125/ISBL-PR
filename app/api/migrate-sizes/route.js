import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { getSizeOptions } from '@/lib/sizeConfig';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ message: 'Size migration route is not available in production.' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const products = await Product.find({
      $or: [{ sizes: { $exists: false } }, { sizes: { $size: 0 } }],
    }).select('_id type category').lean();
    const updates = products.flatMap((product) => {
      const sizeOptions = getSizeOptions(product.type, product.category);
      if (!sizeOptions) return [];
      return [{
        updateOne: {
          filter: { _id: product._id },
          update: {
            $set: {
              sizes: sizeOptions.map((size) => ({ size, stock: 0 })),
              stock: 0,
            },
          },
        },
      }];
    });

    if (updates.length) await Product.bulkWrite(updates);
    return Response.json({ updatedCount: updates.length });
  } catch (error) {
    console.error('Size migration failed', error);
    return Response.json({ message: 'Unable to migrate legacy product sizes.' }, { status: 500 });
  }
}
