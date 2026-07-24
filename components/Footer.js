import Link from 'next/link';

const trustBadges = ['Certified Materials', '7-Day Returns', 'Secure Payments', 'Free Shipping over ₹999'];

export default function Footer() {
  return (
    <footer className="border-t border-gold/20 bg-white/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div>
            <p className="font-fraunces text-2xl text-charcoal">Nandini Jewellers</p>
            <p className="mt-3 max-w-md text-sm leading-7 text-charcoal/75">
              Designed for modern rituals, with luminous gold accents and heirloom-inspired pieces that feel effortless and elevated.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Helpful links</h3>
            <ul className="mt-4 space-y-2 text-sm text-charcoal/80">
              <li><Link href="/about" className="transition hover:text-gold-dark">About</Link></li>
              <li><Link href="/contact" className="transition hover:text-gold-dark">Contact</Link></li>
              <li><Link href="/shipping" className="transition hover:text-gold-dark">Shipping Policy</Link></li>
              <li><Link href="/returns" className="transition hover:text-gold-dark">Returns</Link></li>
              <li><Link href="/faq" className="transition hover:text-gold-dark">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Newsletter</h3>
            <form className="mt-4 flex flex-col gap-3">
              <input type="email" placeholder="Your email" className="rounded-[0.85rem] border border-gold/20 bg-ivory px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold" />
              <button type="button" className="rounded-[0.85rem] bg-gold px-4 py-3 text-sm font-semibold text-white transition hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                Join the list
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-gold/15 bg-ivory/80 px-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-3 text-center text-sm text-charcoal/75">
            {trustBadges.map((badge) => (
              <span key={badge} className="rounded-full border border-gold/20 bg-white px-3 py-2">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
