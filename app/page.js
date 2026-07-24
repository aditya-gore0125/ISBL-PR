import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import SectionDivider from '@/components/SectionDivider';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';

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

const testimonials = [
  { name: 'Meera', quote: 'Every piece feels premium and delicate. The delivery experience was seamless.', rating: 5 },
  { name: 'Priya', quote: 'The finish is beautiful and the styling feels so elegant for everyday wear.', rating: 5 },
  { name: 'Neha', quote: 'I bought this as a gift and the recipient loved it instantly.', rating: 5 },
];

function groupCategories(categories = []) {
  const grouped = { Ladies: [], Gents: [] };
  const source = categories.length ? categories : fallbackCategories;

  source.forEach((category) => {
    const bucket = String(category.type || '').trim() === 'Gents' ? 'Gents' : 'Ladies';
    grouped[bucket].push(category);
  });

  return grouped;
}

export default async function HomePage() {
  await connectToDatabase();

  const categories = await Category.find({}).sort({ displayOrder: 1, name: 1 }).lean();
  const featuredProducts = await Product.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(4).lean();
  const newArrivals = await Product.find({ isNewArrival: true }).sort({ createdAt: -1 }).limit(4).lean();

  const groupedCategories = groupCategories(categories);

  return (
    <>
      <Navbar categories={categories.length ? categories : fallbackCategories} />
      <main className="min-h-screen bg-ivory">
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="overflow-hidden rounded-[1.6rem] border border-gold/15 bg-gradient-to-br from-ivory via-white to-blush/30 shadow-soft">
            <div className="grid gap-6 p-8 sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:p-12">
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gold">Signature jewels for modern romance</p>
                <h1 className="mt-4 font-fraunces text-4xl leading-[1.05] text-charcoal sm:text-5xl lg:text-6xl">
                  Discover radiant pieces made for every celebration.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-8 text-charcoal/80 sm:text-lg">
                  Layered necklaces, sculptural earrings, and timeless rings designed with warm gold and soft blush tones for elevated daily elegance.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/category/necklace" className="inline-flex items-center justify-center rounded-[0.95rem] bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                    Shop Now
                  </Link>
                  <Link href="/collections" className="inline-flex items-center justify-center rounded-[0.95rem] border border-gold/20 bg-white/80 px-6 py-3 text-sm font-semibold text-charcoal transition hover:border-gold hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                    Browse Collections
                  </Link>
                </div>
              </div>
              <div className="overflow-hidden rounded-[1.25rem] border border-gold/15 bg-white/70">
                <img src="/hero-placeholder.svg" alt="Placeholder jewelry hero artwork" className="h-full min-h-[280px] w-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <SectionDivider />
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gold">Shop by Category</p>
              <h2 className="mt-2 font-fraunces text-3xl text-charcoal sm:text-4xl">Curated collections in every style</h2>
            </div>
          </div>

          <div className="mt-8 space-y-8">
            <div>
              <h3 className="mb-4 font-fraunces text-2xl text-charcoal">Shop for Her</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {groupedCategories.Ladies.map((category) => (
                  <Link key={category.slug} href={`/category/${category.slug}`} className="group overflow-hidden rounded-[1.2rem] border border-gold/15 bg-white/80 shadow-soft transition hover:-translate-y-1">
                    <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-blush/30 via-ivory to-gold/10">
                      <img src={category.image || '/hero-placeholder.svg'} alt={category.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-fraunces text-xl text-charcoal">{category.name}</h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-fraunces text-2xl text-charcoal">Shop for Him</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {groupedCategories.Gents.map((category) => (
                  <Link key={category.slug} href={`/category/${category.slug}`} className="group overflow-hidden rounded-[1.2rem] border border-gold/15 bg-white/80 shadow-soft transition hover:-translate-y-1">
                    <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-blush/30 via-ivory to-gold/10">
                      <img src={category.image || '/hero-placeholder.svg'} alt={category.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-fraunces text-xl text-charcoal">{category.name}</h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <SectionDivider />
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gold">Bestsellers</p>
              <h2 className="mt-2 font-fraunces text-3xl text-charcoal sm:text-4xl">Most-loved pieces right now</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={{ ...product, category: product.category || 'Featured' }} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <SectionDivider />
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gold">New Arrivals</p>
              <h2 className="mt-2 font-fraunces text-3xl text-charcoal sm:text-4xl">Freshly curated this week</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={{ ...product, category: product.category || 'New' }} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SectionDivider />
          <div className="rounded-[1.5rem] border border-gold/15 bg-white/70 p-8 shadow-soft sm:p-10">
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gold">Loved by customers</p>
                <h2 className="mt-2 font-fraunces text-3xl text-charcoal sm:text-4xl">A little sparkle, a lot of trust</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {testimonials.map((item) => (
                  <div key={item.name} className="rounded-[1rem] border border-gold/15 bg-ivory/70 p-4">
                    <div className="text-gold">★★★★★</div>
                    <p className="mt-3 text-sm leading-7 text-charcoal/80">“{item.quote}”</p>
                    <p className="mt-3 font-semibold text-charcoal">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
