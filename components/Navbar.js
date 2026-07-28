'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const fallbackCategoryGroups = {
  Ladies: [
    { name: 'Earrings', slug: 'earrings' },
    { name: 'Mangalsutra Pendant', slug: 'mangalsutra-pendant' },
    { name: 'Mangalsutra Chain', slug: 'mangalsutra-chain' },
    { name: 'Mangalsutra Set', slug: 'mangalsutra-set' },
    { name: 'Necklace', slug: 'necklace' },
    { name: 'Bangles', slug: 'bangles' },
    { name: 'Bracelet', slug: 'bracelet' },
    { name: 'Chains', slug: 'chains' },
    { name: 'Nath', slug: 'nath' },
    { name: 'Hair Accessories', slug: 'hair-accessories' },
    { name: 'Others', slug: 'others' },
  ],
  Gents: [
    { name: 'Chain', slug: 'chain' },
    { name: 'Bracelet', slug: 'bracelet' },
    { name: 'Kada', slug: 'kada' },
    { name: 'Earring', slug: 'earring' },
    { name: 'Others', slug: 'others' },
  ],
};

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a7 7 0 100 14 7 7 0 000-14zm6 6h.01" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14l-1 12H6L5 8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8V7a3 3 0 116 0v1" />
    </svg>
  );
}

function groupCategories(categories = []) {
  const grouped = { Ladies: [], Gents: [] };

  categories.forEach((category) => {
    const bucket = String(category.type || '').trim() === 'Gents' ? 'Gents' : 'Ladies';
    grouped[bucket].push(category);
  });

  return grouped;
}

export default function Navbar({ categories = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const categoryGroups = groupCategories(categories);
  const sections = [
    { title: 'Ladies', items: categoryGroups.Ladies.length ? categoryGroups.Ladies : fallbackCategoryGroups.Ladies },
    { title: 'Gents', items: categoryGroups.Gents.length ? categoryGroups.Gents : fallbackCategoryGroups.Gents },
  ];

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gold/20 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-gold/20 bg-white/70 p-2.5 text-charcoal transition hover:border-gold hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold lg:hidden" type="button" aria-label="Open menu" onClick={() => setIsOpen((prev) => !prev)}>
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
          <Link href="/" className="font-fraunces text-xl tracking-[0.08em] text-charcoal transition hover:text-gold-dark sm:text-2xl">
            Nandini Jewellers
          </Link>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          <div className="group relative">
            <details className="group/list">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-charcoal transition hover:bg-gold/10 hover:text-gold-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                Shop
                <span className="text-xs">▾</span>
              </summary>
              <div className="absolute left-0 top-12 w-[28rem] rounded-[1rem] border border-gold/15 bg-white p-4 shadow-soft">
                <div className="grid gap-4 sm:grid-cols-2">
                  {sections.map((section) => (
                    <div key={section.title}>
                      <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-gold">{section.title}</p>
                      <div className="space-y-1">
                        {section.items.map((category) => (
                          <Link key={category.slug} href={`/category/${category.slug}`} className="block rounded-[0.75rem] px-3 py-2 text-sm text-charcoal transition hover:bg-blush/20 hover:text-gold-dark">
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          </div>
          <Link href="/about" className="text-sm font-medium text-charcoal transition hover:text-gold-dark">About</Link>
          <Link href="/contact" className="text-sm font-medium text-charcoal transition hover:text-gold-dark">Contact</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center rounded-full border border-gold/20 bg-white/70 px-2 py-1.5 text-charcoal shadow-sm">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              aria-label="Search products"
              className="w-24 bg-transparent px-2 text-sm outline-none sm:w-32"
            />
            <button className="rounded-full p-2 transition hover:bg-gold/10 hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" type="submit" aria-label="Search">
              <SearchIcon />
            </button>
          </form>
          <Link href="/account" className="rounded-full border border-gold/20 bg-white/70 p-2.5 text-charcoal transition hover:border-gold hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" aria-label="Account">
            <UserIcon />
          </Link>
          <Link href="/cart" className="relative rounded-full border border-gold/20 bg-gold/10 p-2.5 text-charcoal transition hover:border-gold hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" aria-label="Cart">
            <BagIcon />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-maroon text-[0.65rem] font-semibold text-white">
              0
            </span>
          </Link>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-gold/20 bg-white/90 px-4 py-4 shadow-soft lg:hidden sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            <Link href="/" className="rounded-[0.85rem] px-3 py-2 text-sm font-medium text-charcoal transition hover:bg-gold/10 hover:text-gold-dark" onClick={() => setIsOpen(false)}>
              Home
            </Link>
            {sections.map((section) => (
              <div key={section.title} className="rounded-[0.85rem] border border-gold/15 bg-ivory/70 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold">{section.title}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {section.items.map((category) => (
                    <Link key={category.slug} href={`/category/${category.slug}`} className="rounded-[0.75rem] px-2 py-2 text-sm text-charcoal transition hover:bg-blush/20 hover:text-gold-dark" onClick={() => setIsOpen(false)}>
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <Link href="/about" className="rounded-[0.85rem] px-3 py-2 text-sm font-medium text-charcoal transition hover:bg-gold/10 hover:text-gold-dark" onClick={() => setIsOpen(false)}>
              About
            </Link>
            <Link href="/contact" className="rounded-[0.85rem] px-3 py-2 text-sm font-medium text-charcoal transition hover:bg-gold/10 hover:text-gold-dark" onClick={() => setIsOpen(false)}>
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
