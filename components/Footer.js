'use client';

import Link from 'next/link';
import { useState } from 'react';

const trustBadges = ['Certified Materials', '7-Day Returns', 'Secure Payments', 'Free Shipping over ₹999'];

function SocialLinks() {
  const links = [
    {
      label: 'Instagram',
      href: 'https://instagram.com/your-handle',
      icon: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="18" cy="6" r=".8" fill="currentColor" stroke="none" /></>,
    },
    {
      label: 'Facebook',
      href: 'https://facebook.com/your-page',
      icon: <path d="M14 8h3V4h-3a5 5 0 0 0-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9a1 1 0 0 1 1-1z" />,
    },
    {
      label: 'WhatsApp',
      href: 'https://wa.me/910000000000',
      icon: <><path d="M20 11.5a8.3 8.3 0 0 1-12.3 7.2L4 20l1.3-3.5A8.3 8.3 0 1 1 20 11.5Z" /><path d="M9 8.5c.2-.5.5-.5.8-.5h.4c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.5.6c-.2.2-.2.4-.1.6.4.7 1 1.3 1.7 1.7.2.1.4.1.6-.1l.6-.6c.2-.2.4-.2.7-.1l1.6.8c.3.1.4.3.4.5 0 .3-.2 1-.6 1.3-.4.4-1 .6-1.7.5-1.1-.2-2.4-.8-3.7-2-1.1-1-1.8-2.2-2-3.2-.2-.9.2-1.7.7-2.2Z" /></>,
    },
    {
      label: 'X',
      href: 'https://x.com/your-handle',
      icon: <path d="M5 4h4.2l9.8 16h-4.2L5 4Zm0 16 6.2-7.1M12.8 11.1 19 4" />,
    },
  ];

  return (
    <nav aria-label="Social media" className="mt-5 flex flex-wrap gap-2">
      {links.map(({ label, href, icon }) => (
        <a key={label} href={href} aria-label={label} target="_blank" rel="noreferrer" className="grid h-11 w-11 place-items-center rounded-full border border-gold/20 bg-white text-charcoal transition hover:border-gold hover:text-gold-dark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">{icon}</svg>
        </a>
      ))}
    </nav>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', kind: '' });

  const handleNewsletterSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback({ message: '', kind: '' });

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.status === 409) {
        setFeedback({ message: data.message || 'This email is already subscribed.', kind: 'duplicate' });
        return;
      }
      if (!response.ok) throw new Error(data?.message || 'Unable to subscribe right now.');
      setEmail('');
      setFeedback({ message: data.message || 'You are on the list.', kind: 'success' });
    } catch (error) {
      setFeedback({ message: error.message || 'Unable to subscribe right now.', kind: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-gold/20 bg-white/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div>
            <p className="font-fraunces text-2xl text-charcoal">Nandini Jewellers</p>
            <p className="mt-3 max-w-md text-sm leading-7 text-charcoal/75">
              Designed for modern rituals, with luminous gold accents and heirloom-inspired pieces that feel effortless and elevated.
            </p>
            <SocialLinks />
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Helpful links</h3>
            <ul className="mt-4 space-y-2 text-sm text-charcoal/80">
              <li><Link href="/about" className="inline-flex min-h-11 items-center px-3 transition hover:text-gold-dark">About</Link></li>
              <li><Link href="/contact" className="inline-flex min-h-11 items-center px-3 transition hover:text-gold-dark">Contact</Link></li>
              <li><Link href="/shipping" className="inline-flex min-h-11 items-center px-3 transition hover:text-gold-dark">Shipping Policy</Link></li>
              <li><Link href="/returns" className="inline-flex min-h-11 items-center px-3 transition hover:text-gold-dark">Returns</Link></li>
              <li><Link href="/faq" className="inline-flex min-h-11 items-center px-3 transition hover:text-gold-dark">FAQ</Link></li>
              <li><Link href="/collections" className="inline-flex min-h-11 items-center px-3 transition hover:text-gold-dark">Collections</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Newsletter</h3>
            <form className="mt-4 flex flex-col gap-3" onSubmit={handleNewsletterSubmit}>
              <label className="sr-only" htmlFor="newsletter-email">Email address</label>
              <input id="newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} autoComplete="email" required placeholder="Your email" className="min-h-11 rounded-[0.85rem] border border-gold/20 bg-ivory px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold" />
              <button type="submit" disabled={submitting} className="min-h-11 rounded-[0.85rem] bg-gold px-4 py-3 text-sm font-semibold text-white transition hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-wait disabled:opacity-70">
                {submitting ? 'Joining...' : 'Join the list'}
              </button>
              <p aria-live="polite" className={`min-h-5 text-sm ${feedback.kind === 'error' ? 'text-maroon' : 'text-emerald-800'}`}>{feedback.message}</p>
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
