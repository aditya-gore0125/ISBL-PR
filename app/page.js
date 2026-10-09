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

  const rawCategories = await Category.find({}).sort({ displayOrder: 1, name: 1 }).lean();
  const rawFeaturedProducts = await Product.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(4).lean();
  const rawNewArrivals = await Product.find({ isNewArrival: true }).sort({ createdAt: -1 }).limit(4).lean();

  const categories = JSON.parse(JSON.stringify(rawCategories));
  const featuredProducts = JSON.parse(JSON.stringify(rawFeaturedProducts));
  const newArrivals = JSON.parse(JSON.stringify(rawNewArrivals));

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

        {/* About Section */}
        <section id="about" className="scroll-mt-20 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SectionDivider />
          <div className="overflow-hidden rounded-[1.6rem] border border-gold/15 bg-gradient-to-br from-white via-ivory to-blush/25 p-8 shadow-soft sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gold">The Story of Nandini</p>
                <h2 className="mt-3 font-fraunces text-3xl leading-tight text-charcoal sm:text-4xl">
                  Artisanal heritage, sculpted for modern celebrations.
                </h2>
                <p className="mt-4 text-base leading-8 text-charcoal/80">
                  Founded with a vision to preserve indigenous Indian goldsmithing techniques while tailoring silhouetted pieces for today’s woman. From luminous bridal choker sets to minimalist daily chains, every piece carries enduring grace.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[1rem] border border-gold/15 bg-white/80 p-4">
                    <p className="font-fraunces text-2xl text-gold">100%</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-charcoal/70">Certified Quality</p>
                  </div>
                  <div className="rounded-[1rem] border border-gold/15 bg-white/80 p-4">
                    <p className="font-fraunces text-2xl text-gold">25+ Yrs</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-charcoal/70">Goldsmithing Legacy</p>
                  </div>
                  <div className="rounded-[1rem] border border-gold/15 bg-white/80 p-4">
                    <p className="font-fraunces text-2xl text-gold">50,000+</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-charcoal/70">Cherished Clients</p>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-soft transition hover:bg-gold-dark"
                  >
                    <span>Read Our Heritage</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-gold/20 bg-ivory/80 p-6 text-center">
                <div className="rounded-[1.2rem] border border-dashed border-gold/30 p-8 bg-white/60">
                  <span className="font-fraunces text-3xl text-gold">Nandini</span>
                  <p className="mt-2 text-xs uppercase tracking-[0.35em] text-charcoal/60">Signature Promise</p>
                  <p className="mt-5 font-fraunces italic text-base leading-relaxed text-charcoal/85">
                    “True jewelry transcends trends. It becomes part of your story, sparkling with memory and tradition.”
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold-dark">Handcrafted</span>
                    <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold-dark">Ethically Sourced</span>
                    <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold-dark">Hallmark Certified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Visit Us Section */}
        <section id="contact" className="scroll-mt-20 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SectionDivider />
          <div className="rounded-[1.6rem] border border-gold/15 bg-white/80 p-8 shadow-soft sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gold">Personal Concierge</p>
                <h2 className="mt-2 font-fraunces text-3xl text-charcoal sm:text-4xl">Visit Us or Connect Online</h2>
                <p className="mt-4 text-base leading-7 text-charcoal/75">
                  Looking for bespoke bridal styling, custom resizing, or doorstep insured delivery assistance? Our jewelry specialists are always delighted to help.
                </p>

                <div className="mt-8 space-y-4 text-sm text-charcoal/80">
                  <div className="flex items-start gap-3">
                    <span className="text-gold font-bold">📍</span>
                    <p>Shop 14-16, Heritage Royale Arcade, Near MG Road, Camp, Pune, Maharashtra 411001</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gold font-bold">📞</span>
                    <p>+91 (020) 2613-8890 / +91 98220 12345</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gold font-bold">✉️</span>
                    <p>concierge@nandinijewellers.com</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/contact"
                    className="rounded-full bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-soft transition hover:bg-gold-dark"
                  >
                    Open Contact Form
                  </Link>
                  <a
                    href="https://wa.me/919822012345"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-emerald-600 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-gold/15 bg-ivory/60 p-6 sm:p-8">
                <h3 className="font-fraunces text-2xl text-charcoal">Showroom Experience Hours</h3>
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center justify-between border-b border-gold/10 pb-3">
                    <span className="font-medium text-charcoal">Monday – Saturday</span>
                    <span className="text-gold-dark font-semibold">10:30 AM – 8:30 PM</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gold/10 pb-3">
                    <span className="font-medium text-charcoal">Sunday</span>
                    <span className="text-gold-dark font-semibold">11:00 AM – 7:30 PM</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-medium text-charcoal">Private Bridal Appointments</span>
                    <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-gold-dark">Available on request</span>
                  </div>
                </div>

                <div className="mt-8 rounded-xl border border-gold/20 bg-white p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">Insured Pan-India Delivery</p>
                  <p className="mt-1 text-xs text-charcoal/70">Complimentary secured shipping on all prepaid online orders over ₹999.</p>
                </div>
              </div>
            </div>
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
