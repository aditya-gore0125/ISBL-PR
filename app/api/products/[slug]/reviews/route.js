import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
    }

    const rating = body?.rating;
    const comment = typeof body?.comment === 'string' ? body.comment.trim() : '';
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be an integer from 1 to 5.' }, { status: 400 });
    }
    if (comment.length < 5 || comment.length > 1000) {
      return NextResponse.json({ error: 'Review must be between 5 and 1000 characters.' }, { status: 400 });
    }

    await connectToDatabase();
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const review = {
      user: userId,
      name: session.user.name,
      rating,
      comment,
    };

    const product = await Product.findOneAndUpdate(
      { slug: params?.slug },
      [
        {
          $set: {
            reviews: {
              $let: {
                vars: { currentReviews: { $ifNull: ['$reviews', []] } },
                in: {
                  $cond: [
                    {
                      $in: [
                        { $literal: userId },
                        { $map: { input: '$$currentReviews', as: 'review', in: '$$review.user' } },
                      ],
                    },
                    {
                      $map: {
                        input: '$$currentReviews',
                        as: 'review',
                        in: {
                          $cond: [
                            { $eq: ['$$review.user', { $literal: userId }] },
                            { $mergeObjects: ['$$review', { $literal: review }] },
                            '$$review',
                          ],
                        },
                      },
                    },
                    {
                      $concatArrays: [
                        '$$currentReviews',
                        [{ $mergeObjects: [{ $literal: review }, { createdAt: { $literal: new Date() } }] }],
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $set: {
            numReviews: { $size: { $ifNull: ['$reviews', []] } },
            rating: {
              $let: {
                vars: { currentReviews: { $ifNull: ['$reviews', []] } },
                in: {
                  $cond: [
                    { $gt: [{ $size: '$$currentReviews' }, 0] },
                    {
                      $round: [
                        {
                          $divide: [
                            {
                              $reduce: {
                                input: '$$currentReviews',
                                initialValue: 0,
                                in: {
                                  $add: [
                                    '$$value',
                                    {
                                      $convert: {
                                        input: '$$this.rating',
                                        to: 'double',
                                        onError: 0,
                                        onNull: 0,
                                      },
                                    },
                                  ],
                                },
                              },
                            },
                            { $size: '$$currentReviews' },
                          ],
                        },
                        1,
                      ],
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      ],
      { new: true, runValidators: false }
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Review saved.', rating: product.rating, numReviews: product.numReviews });
  } catch (error) {
    console.error('Product review error', error);
    return NextResponse.json({ error: 'Unable to save your review.' }, { status: 500 });
  }
}