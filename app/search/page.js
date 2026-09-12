import Link from 'next/link';
import Navbar from '@/components/Navbar';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import {
  Heart,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Search,
} from 'lucide-react';

export const metadata = {
  title: 'Search Jewelry | Nandini Jewellers',
  description:
    'Search jewelry products by name, description, or category at Nandini Jewellers.',
};

function normalizeQuery(query) {
  return typeof query === 'string' ? query.trim() : '';
}

function SearchProductCard({ product }) {
  return (
    <div className="group overflow-hidden rounded-[1.2rem] border border-gold/10 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lg">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-ivory">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm text-charcoal/50">
              No image available
            </span>
          </div>
        )}

        {/* Blue Like Button */}
        <button
          type="button"
          aria-label={`Like ${product.name}`}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition hover:scale-110"
        >
          <Heart className="h-5 w-5 fill-blue-500 text-blue-500" />
        </button>
      </div>

      {/* Product Details */}
      <div className="p-5">
        <h2 className="font-fraunces text-lg text-charcoal">
          {product.name}
        </h2>

        {product.category && (
          <p className="mt-1 text-sm text-charcoal/60">
            {product.category}
          </p>
        )}

        {product.rating !== undefined && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm tracking-wide text-gold">
              {'★'.repeat(Math.round(product.rating))}
            </span>

            <span className="text-xs text-charcoal/60">
              ({product.rating})
            </span>
          </div>
        )}

        {product.price !== undefined && (
          <p className="mt-3 text-xl font-semibold text-charcoal">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </p>
        )}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 md:flex-row md:items-center md:justify-between">

        {/* Logo */}
        <div>
          <div className="font-fraunces text-2xl tracking-[0.15em] text-gold">
            NANDINI
          </div>

          <p className="mt-1 text-xs tracking-[0.3em] text-white/70">
            JEWELLERS
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap gap-6 text-sm text-white/80">
          <Link href="/" className="transition hover:text-gold">
            About
          </Link>

          <Link href="/" className="transition hover:text-gold">
            Contact
          </Link>

          <Link href="/" className="transition hover:text-gold">
            FAQ
          </Link>

          <Link href="/" className="transition hover:text-gold">
            Shipping
          </Link>

          <Link href="/" className="transition hover:text-gold">
            Returns
          </Link>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-5">
          <a
            href="#"
            aria-label="Instagram"
            className="transition hover:text-gold"
          >
            <Instagram className="h-5 w-5" />
          </a>

          <a
            href="#"
            aria-label="Facebook"
            className="transition hover:text-gold"
          >
            <Facebook className="h-5 w-5" />
          </a>

          {/* Twitter - Added */}
          <a
            href="#"
            aria-label="Twitter"
            className="transition hover:text-blue-500"
          >
            <Twitter className="h-5 w-5 text-blue-500" />
          </a>

          <a
            href="#"
            aria-label="YouTube"
            className="transition hover:text-gold"
          >
            <Youtube className="h-5 w-5" />
          </a>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/50">
        Timeless Beauty, Forever Yours
      </div>
    </footer>
  );
}

export default async function SearchPage({ searchParams }) {
  const query = normalizeQuery(searchParams?.q);

  await connectToDatabase();

  const products = query
    ? await Product.find({
        $or: [
          {
            name: {
              $regex: query,
              $options: 'i',
            },
          },
          {
            description: {
              $regex: query,
              $options: 'i',
            },
          },
          {
            category: {
              $regex: query,
              $options: 'i',
            },
          },
        ],
      })
        .sort({
          rating: -1,
          createdAt: -1,
        })
        .limit(24)
        .lean()
    : [];

  return (
    <>
      <Navbar categories={[]} />

      <main className="min-h-screen bg-ivory">
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

          {/* Search Header */}
          <div className="mb-8 rounded-[1.5rem] border border-gold/15 bg-gradient-to-br from-white via-ivory to-blush/30 p-8 shadow-soft">

            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gold">
              Search results
            </p>

            <h1 className="mt-3 font-fraunces text-3xl text-charcoal sm:text-4xl">
              {query
                ? `Showing matches for “${query}”`
                : 'Search for jewelry pieces'}
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-charcoal/70">
              Search by product name, description, or category to find the
              perfect piece.
            </p>
          </div>

          {/* No Search Query */}
          {!query ? (
            <div className="rounded-[1.4rem] border border-dashed border-gold/25 bg-white/75 p-10 text-center shadow-soft">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ivory">
                <Search className="h-7 w-7 text-gold" />
              </div>

              <h2 className="mt-5 font-fraunces text-2xl text-charcoal">
                Start a search
              </h2>

              <p className="mt-3 text-base leading-7 text-charcoal/70">
                Use the search box in the navigation to find rings,
                necklaces, and more.
              </p>
            </div>

          ) : products.length === 0 ? (

            /* No Results */
            <div className="rounded-[1.4rem] border border-dashed border-gold/25 bg-white/75 p-10 text-center shadow-soft">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ivory">
                <Search className="h-7 w-7 text-gold" />
              </div>

              <h2 className="mt-5 font-fraunces text-2xl text-charcoal">
                No pieces match these filters yet
              </h2>

              <p className="mt-3 text-base leading-7 text-charcoal/70">
                Try a broader search term or browse the category collections
                directly.
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex rounded-[0.95rem] bg-gold px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-gold-dark"
              >
                Browse collections
              </Link>
            </div>

          ) : (

            /* Products */
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <SearchProductCard
                  key={product._id.toString()}
                  product={product}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}