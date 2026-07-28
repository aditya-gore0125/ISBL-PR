import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

export const metadata = {
  title: 'Search Jewelry | Nandini Jewellers',
  description: 'Search jewelry products by name, description, or category at Nandini Jewellers.',
};

function normalizeQuery(query) {
  return typeof query === 'string' ? query.trim() : '';
}

export default async function SearchPage({ searchParams }) {
  const query = normalizeQuery(searchParams?.q);

  await connectToDatabase();

  const products = query
    ? await Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
        ],
      })
        .sort({ rating: -1, createdAt: -1 })
        .limit(24)
        .lean()
    : [];

  return (
    <>
      <Navbar categories={[]} />
      <main className="min-h-screen bg-ivory">
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mb-8 rounded-[1.5rem] border border-gold/15 bg-gradient-to-br from-white via-ivory to-blush/30 p-8 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gold">Search results</p>
            <h1 className="mt-3 font-fraunces text-3xl text-charcoal sm:text-4xl">
              {query ? `Showing matches for “${query}”` : 'Search for jewelry pieces'}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-charcoal/70">
              Search by product name, description, or category to find the perfect piece.
            </p>
          </div>

          {!query ? (
            <div className="rounded-[1.4rem] border border-dashed border-gold/25 bg-white/75 p-10 text-center shadow-soft">
              <h2 className="font-fraunces text-2xl text-charcoal">Start a search</h2>
              <p className="mt-3 text-base leading-7 text-charcoal/70">Use the search box in the navigation to find rings, necklaces, and more.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[1.4rem] border border-dashed border-gold/25 bg-white/75 p-10 text-center shadow-soft">
              <h2 className="font-fraunces text-2xl text-charcoal">No pieces match these filters yet</h2>
              <p className="mt-3 text-base leading-7 text-charcoal/70">Try a broader search term or browse the category collections directly.</p>
              <Link href="/" className="mt-6 inline-flex rounded-[0.95rem] bg-gold px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-gold-dark">
                Browse collections
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
