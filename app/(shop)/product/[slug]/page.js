import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import ExpandableText from '@/components/ExpandableText';
import ProductCard from '@/components/ProductCard';
import ProductGallery from '@/components/ProductGallery';
import ProductPurchasePanel from '@/components/ProductPurchasePanel';
import ReviewForm from '@/components/ReviewForm';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

function formatDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'Recently added';
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getProductDescription(product) {
  if (product?.metaDescription) return product.metaDescription;
  return `${product?.name || 'Jewelry piece'} crafted with thoughtful detail and premium finishes.`;
}

function getProductTitle(product) {
  if (product?.metaTitle) return product.metaTitle;
  return product?.name || 'Jewelry piece';
}

function buildJsonLd(product) {
  const images = Array.isArray(product?.images) && product.images.length ? product.images : [];
  const basePrice = Number(product?.price || 0);
  const discountPrice = Number(product?.discountPrice || 0);
  const price = discountPrice > 0 && discountPrice < basePrice ? discountPrice : basePrice;
  const availability = Number(product?.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  const ratingValue = Number(product?.rating || 0);
  const reviewCount = Number(product?.numReviews || 0);
  const siteUrl = String(process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '');

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product?.name,
    image: images,
    description: product?.description,
    category: product?.category,
    material: product?.material,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price,
      availability,
      url: `${siteUrl}/product/${product?.slug}`,
    },
    ...(reviewCount > 0
      ? { aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue,
          reviewCount,
        } }
      : {}),
  };
}

export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;
  await connectToDatabase();
  const product = await Product.findOne({ slug }).lean();

  if (!product) {
    return {
      title: 'Product not found | Nandini Jewellers',
      description: 'The requested jewelry product could not be found.',
    };
  }

  return {
    title: getProductTitle(product),
    description: getProductDescription(product),
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title: getProductTitle(product),
      description: getProductDescription(product),
      images: Array.isArray(product.images) && product.images.length ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;

  await connectToDatabase();
  const product = await Product.findOne({ slug }).lean();

  if (!product) {
    notFound();
  }

  const [session, relatedProducts] = await Promise.all([
    getServerSession(authOptions),
    Product.find({
      category: product.category,
      type: product.type,
      _id: { $ne: product._id },
    })
      .sort({ rating: -1, createdAt: -1 })
      .limit(4)
      .lean(),
  ]);

  const stockLabel = Number(product.stock || 0) > 0 ? 'In Stock' : 'Out of Stock';
  const stockClass = Number(product.stock || 0) > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-maroon/10 text-maroon';
  const ratingValue = Number(product.rating || 0);
  const reviewCount = Number(product.numReviews || 0);
  const jsonLd = JSON.stringify(buildJsonLd(product)).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <main className="min-h-screen bg-ivory">
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <ProductGallery images={product.images || []} alt={product.name} />
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-gold/20 bg-white/80 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-gold">{product.category}</span>
                {product.material ? <span className="rounded-full border border-gold/20 bg-white/80 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-charcoal/80">{product.material}</span> : null}
              </div>
              <h1 className="mt-5 font-fraunces text-4xl leading-tight text-charcoal sm:text-5xl">{product.name}</h1>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-charcoal/70">
                <div className="flex items-center gap-1 text-gold">
                  {Array.from({ length: 5 }, (_, index) => (
                    <span key={`${product.slug}-${index}`} className={index < Math.round(ratingValue) ? 'text-gold' : 'text-gold/35'}>★</span>
                  ))}
                </div>
                <span>{ratingValue.toFixed(1)} rating</span>
                <span>•</span>
                <span>{reviewCount} reviews</span>
              </div>

              <span className={`mt-6 w-fit rounded-full px-3 py-1 text-sm font-semibold ${stockClass}`}>{stockLabel}</span>
              <ProductPurchasePanel
                productId={String(product._id)}
                name={String(product.name || '')}
                price={Number(product.price || 0)}
                discountPrice={Number(product.discountPrice || 0)}
                image={String(product.images?.[0] || '/hero-placeholder.svg')}
                stock={Number(product.stock || 0)}
              />

              <div className="mt-8 rounded-[1.2rem] border border-gold/15 bg-white/70 p-5 shadow-soft">
                <h2 className="font-fraunces text-2xl text-charcoal">Description</h2>
                <div className="mt-4 text-base leading-8 text-charcoal/75">
                  <ExpandableText text={String(product.description || '')} />
                </div>
              </div>
            </div>
          </div>

          <section className="mt-12 rounded-[1.4rem] border border-gold/15 bg-white/70 p-6 shadow-soft sm:p-8">
            <h2 className="font-fraunces text-2xl text-charcoal">Specifications</h2>
            <div className="mt-6 overflow-hidden rounded-[1rem] border border-gold/15">
              <table className="min-w-full divide-y divide-gold/15 text-left text-sm text-charcoal/80">
                <tbody>
                  <tr className="bg-white/80">
                    <th className="w-40 px-4 py-3 font-semibold text-charcoal">Material</th>
                    <td className="px-4 py-3">{product.material || 'Not specified'}</td>
                  </tr>
                  <tr className="bg-ivory/70">
                    <th className="w-40 px-4 py-3 font-semibold text-charcoal">Category</th>
                    <td className="px-4 py-3">{product.category}</td>
                  </tr>
                  <tr className="bg-white/80">
                    <th className="w-40 px-4 py-3 font-semibold text-charcoal">Type</th>
                    <td className="px-4 py-3">{product.type || 'Not specified'}</td>
                  </tr>
                  <tr className="bg-ivory/70">
                    <th className="w-40 px-4 py-3 font-semibold text-charcoal">Stock status</th>
                    <td className="px-4 py-3">{stockLabel}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12 rounded-[1.4rem] border border-gold/15 bg-white/70 p-6 shadow-soft sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-fraunces text-2xl text-charcoal">Reviews</h2>
                <p className="mt-2 text-sm text-charcoal/70">Share your experience with this piece.</p>
              </div>
              <div className="rounded-full border border-gold/15 bg-ivory/70 px-3 py-2 text-sm text-charcoal/70">
                {reviewCount} review{reviewCount === 1 ? '' : 's'}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {product.reviews && product.reviews.length > 0 ? product.reviews.map((review) => (
                <article key={`${review.name}-${review.createdAt}`} className="rounded-[1rem] border border-gold/15 bg-ivory/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-charcoal">{review.name}</p>
                      <div className="mt-1 flex items-center gap-1 text-sm text-gold">
                        {Array.from({ length: 5 }, (_, index) => (
                          <span key={`${review.name}-${index}`} className={index < Number(review.rating || 0) ? 'text-gold' : 'text-gold/35'}>★</span>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-charcoal/60">{formatDate(review.createdAt)}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-charcoal/75">{review.comment}</p>
                </article>
              )) : (
                <div className="rounded-[1rem] border border-dashed border-gold/20 bg-ivory/50 p-5 text-sm text-charcoal/70">
                  No reviews yet. Be the first to share your thoughts.
                </div>
              )}
            </div>

            <div className="mt-8 rounded-[1rem] border border-gold/15 bg-ivory/50 p-5">
              {session?.user?.id ? (
                <>
                  <h3 className="mb-4 font-fraunces text-xl text-charcoal">Leave a review</h3>
                  <ReviewForm slug={String(product.slug)} />
                </>
              ) : (
                <Link href={`/login?redirect=${encodeURIComponent(`/product/${product.slug}`)}`} className="inline-flex rounded-[0.95rem] bg-gold px-4 py-3 text-sm font-semibold uppercase text-white transition hover:bg-gold-dark">
                  Log in to leave a review
                </Link>
              )}
            </div>
          </section>

          <section className="mt-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gold">You may also like</p>
                <h2 className="mt-2 font-fraunces text-3xl text-charcoal">Related pieces</h2>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct._id} product={{ ...relatedProduct, category: relatedProduct.category || 'Related' }} />
              ))}
            </div>
          </section>
        </section>
      </main>
    </>
  );
}
