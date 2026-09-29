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
    const product = await Product.findOne({ slug: params?.slug });
    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const review = {
      user: session.user.id,
      name: session.user.name,
      rating,
      comment,
    };
    const existingReview = product.reviews.find((entry) => String(entry.user) === String(session.user.id));
    if (existingReview) {
      existingReview.name = review.name;
      existingReview.rating = review.rating;
      existingReview.comment = review.comment;
    } else {
      product.reviews.push(review);
    }

    const reviewCount = product.reviews.length;
    const ratingTotal = product.reviews.reduce((sum, entry) => sum + Number(entry.rating || 0), 0);
    product.numReviews = reviewCount;
    product.rating = reviewCount ? Number((ratingTotal / reviewCount).toFixed(1)) : 0;
    await product.save();

    return NextResponse.json({ message: 'Review saved.', rating: product.rating, numReviews: product.numReviews });
  } catch (error) {
    console.error('Product review error', error);
    return NextResponse.json({ error: 'Unable to save your review.' }, { status: 500 });
  }
}