import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductGallery from '@/components/ProductGallery';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

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
  return `${product?.name || 'Jewelry piece'} | Nandini Jewellers`;
}

function buildJsonLd(product) {
  const images = Array.isArray(product?.images) && product.images.length ? product.images : [];
  const price = Number(product?.discountPrice || product?.price || 0);
  const availability = Number(product?.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  const ratingValue = Number(product?.rating || 0);

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
      url: `https://example.com/product/${product?.slug}`,
    },
    aggregateRating: ratingValue > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue,
          reviewCount: Number(product?.numReviews || 0),
        }
      : undefined,
  };
}

export async function generateMetadata({ params }) {
  const slug = params?.slug;
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
    other: {
      'application/ld+json': JSON.stringify(buildJsonLd(product)),
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const slug = params?.slug;

  await connectToDatabase();
  const product = await Product.findOne({ slug }).lean();

  if (!product) {
    notFound();
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  })
    .sort({ rating: -1, createdAt: -1 })
    .limit(4)
    .lean();

  const hasDiscount = Number(product.discountPrice) > 0 && Number(product.discountPrice) < Number(product.price);
  const stockLabel = Number(product.stock || 0) > 0 ? 'In Stock' : 'Out of Stock';
  const stockClass = Number(product.stock || 0) > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-maroon/10 text-maroon';
  const descriptionWords = String(product.description || '').split(/\s+/).filter(Boolean);
  const shouldShowReadMore = descriptionWords.length > 40;
  const ratingValue = Number(product.rating || 0);
  const reviewCount = Number(product.numReviews || 0);

  return (
    <>
      <Navbar categories={[]} />
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

              <div className="mt-6 flex items-center gap-3">
                {hasDiscount ? (
                  <>
                    <span className="text-sm text-charcoal/60 line-through">{formatCurrency(product.price)}</span>
                    <span className="font-fraunces text-3xl text-maroon">{formatCurrency(product.discountPrice)}</span>
                  </>
                ) : (
                  <span className="font-fraunces text-3xl text-charcoal">{formatCurrency(product.price)}</span>
                )}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${stockClass}`}>{stockLabel}</span>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center rounded-[0.95rem] border border-gold/20 bg-white/70 px-3 py-2">
                  <label htmlFor="quantity" className="mr-3 text-sm font-semibold text-charcoal">Qty</label>
                  <select id="quantity" name="quantity" defaultValue="1" className="bg-transparent text-sm text-charcoal outline-none">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // TODO: wire up cart action in Phase 5
                    console.log('Add to cart', product.slug);
                  }}
                  className="flex-1 rounded-[0.95rem] bg-gold px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-gold-dark"
                >
                  Add to Cart
                </button>
              </div>
              <button type="button" className="mt-3 w-full rounded-[0.95rem] border border-gold/20 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-charcoal transition hover:border-gold hover:text-gold-dark sm:w-auto">
                Buy Now
              </button>

              <div className="mt-8 rounded-[1.2rem] border border-gold/15 bg-white/70 p-5 shadow-soft">
                <h2 className="font-fraunces text-2xl text-charcoal">Description</h2>
                <div className="mt-4 space-y-3 text-base leading-8 text-charcoal/75">
                  <p>{shouldShowReadMore ? `${String(product.description || '').slice(0, 260)}...` : String(product.description || '')}</p>
                  {shouldShowReadMore ? <button type="button" className="text-sm font-semibold text-gold-dark">Read more</button> : null}
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
                    <th className="w-40 px-4 py-3 font-semibold text-charcoal">Plating</th>
                    <td className="px-4 py-3">{product.plating || 'Not specified'}</td>
                  </tr>
                  <tr className="bg-white/80">
                    <th className="w-40 px-4 py-3 font-semibold text-charcoal">Dimensions</th>
                    <td className="px-4 py-3">{product.dimensions || 'Not specified'}</td>
                  </tr>
                  <tr className="bg-ivory/70">
                    <th className="w-40 px-4 py-3 font-semibold text-charcoal">Weight</th>
                    <td className="px-4 py-3">{product.weight || 'Not specified'}</td>
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
              <h3 className="font-fraunces text-xl text-charcoal">Leave a review</h3>
              <p className="mt-2 text-sm text-charcoal/70">Please log in to share your feedback.</p>
              <div className="mt-4">
                <Link href="/login" className="inline-flex rounded-[0.95rem] bg-gold px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-gold-dark">
                  Log in to leave a review
                </Link>
              </div>
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
      <Footer />
    </>
  );
}
