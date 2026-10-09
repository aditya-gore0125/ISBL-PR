import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'About Us | Nandini Jewellers',
  description:
    'Discover the legacy, craftsmanship, and story behind Nandini Jewellers. Handcrafted traditional and contemporary fine jewelry.',
};

const brandValues = [
  {
    title: 'Certified Authenticity',
    description:
      'Every gemstone and gold-plated alloy is stringently tested and certified for purity and long-lasting brilliance.',
    icon: (
      <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Artisanal Craftsmanship',
    description:
      'Rooted in centuries-old Indian goldsmithing techniques, fused with contemporary silhouettes for daily and bridal grace.',
    icon: (
      <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
  {
    title: 'Ethical Sourcing',
    description:
      'We partner with certified suppliers ensuring fair trade, ethical labor practices, and sustainable material stewardship.',
    icon: (
      <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    title: 'Lifetime Concierge Care',
    description:
      'Our dedicated customer concierge provides complimentary re-polishing guidance, sizing help, and bespoke styling advice.',
    icon: (
      <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
];

const milestones = [
  { year: '1998', title: 'The Humble Beginning', desc: 'Started as a boutique atelier catering to heirloom bridal jewelry commissions in Maharashtra.' },
  { year: '2010', title: 'Mastering Modern Alloys', desc: 'Pioneered lightweight luxury jewelry combining 22K gold vermeil with American Diamonds for everyday wear.' },
  { year: '2018', title: 'Flagship Showroom', desc: 'Opened our expansive luxury experience center with private bridal consultation suites.' },
  { year: '2024', title: 'The Digital Flagship', desc: 'Launched direct-to-consumer online shopping with doorstep insured delivery across India.' },
];

export default function AboutPage() {
  return (
    <>
      <Navbar categories={[]} />

      <main className="min-h-screen bg-ivory">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-ivory via-white to-blush/30 py-16 sm:py-24 border-b border-gold/15">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold">
                  Our Story & Heritage
                </p>
                <h1 className="mt-4 font-fraunces text-4xl leading-tight text-charcoal sm:text-5xl lg:text-6xl">
                  Where timeless Indian royalty meets modern grace.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-8 text-charcoal/80 sm:text-lg">
                  At Nandini Jewellers, every ornament tells a celebration of individuality, heritage, and pure sentiment.
                  Designed for life’s grandest milestones and intimate everyday moments alike.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/category/necklaces"
                    className="rounded-full bg-gold px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-soft transition hover:bg-gold-dark"
                  >
                    Explore Creations
                  </Link>
                  <Link
                    href="/contact"
                    className="rounded-full border border-gold/30 bg-white/80 px-8 py-3.5 text-sm font-semibold text-charcoal transition hover:border-gold hover:text-gold-dark"
                  >
                    Contact Concierge
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="overflow-hidden rounded-[2rem] border border-gold/20 bg-white p-3 shadow-lg">
                  <div className="aspect-[4/3] rounded-[1.6rem] bg-gradient-to-br from-blush/40 via-ivory to-gold/20 flex flex-col items-center justify-center p-8 text-center">
                    <span className="font-fraunces text-4xl text-gold">Nandini</span>
                    <span className="mt-2 text-xs uppercase tracking-[0.4em] text-charcoal/70">Haute Joaillerie</span>
                    <div className="mt-6 h-px w-24 bg-gold/30"></div>
                    <p className="mt-6 font-fraunces italic text-lg text-charcoal/90">
                      “Jewelry is not merely an accessory; it is an heirloom that carries stories across generations.”
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Philosophy */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold">The Nandini Standard</p>
            <h2 className="mt-3 font-fraunces text-3xl text-charcoal sm:text-4xl">
              Crafted with Uncompromising Devotion
            </h2>
            <p className="mt-4 text-base leading-7 text-charcoal/75">
              Each piece in our boutique undergoes over 40 hours of artisanal detailing — from the first hand-drawn sketch to precision stone setting and mirror-finish polishing.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {brandValues.map((val) => (
              <div
                key={val.title}
                className="rounded-[1.5rem] border border-gold/15 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ivory border border-gold/20">
                  {val.icon}
                </div>
                <h3 className="mt-5 font-fraunces text-xl text-charcoal">{val.title}</h3>
                <p className="mt-2.5 text-sm leading-6 text-charcoal/70">{val.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Journey Timeline */}
        <section className="border-y border-gold/15 bg-white/70 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold">Our Legacy</p>
              <h2 className="mt-3 font-fraunces text-3xl text-charcoal sm:text-4xl">Over Two Decades of Sparkle</h2>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {milestones.map((m, index) => (
                <div key={m.year} className="relative rounded-[1.25rem] border border-gold/15 bg-ivory/60 p-6">
                  <div className="font-fraunces text-3xl font-bold text-gold">{m.year}</div>
                  <h4 className="mt-3 font-fraunces text-lg text-charcoal">{m.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-gold/20 bg-gradient-to-r from-gold/15 via-ivory to-blush/30 p-10 text-center shadow-soft sm:p-14">
            <h2 className="font-fraunces text-3xl text-charcoal sm:text-4xl">
              Ready to find your signature piece?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-charcoal/75">
              Explore our curated bridal sets, daily wear necklaces, and custom pieces. Enjoy complimentary express insured shipping on all orders.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/"
                className="rounded-full bg-gold px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-gold-dark"
              >
                Browse Collections
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

