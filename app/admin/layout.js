import Link from 'next/link';

const navItems = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/categories', label: 'Categories' },
];

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-[1.5rem] border border-gold/15 bg-white/85 p-4 shadow-soft backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Store management</p>
              <h1 className="mt-2 font-fraunces text-3xl text-charcoal">Admin dashboard</h1>
            </div>
            <Link href="/" className="inline-flex items-center justify-center rounded-full border border-gold/30 bg-gold/5 px-4 py-2 text-sm font-semibold text-charcoal transition hover:bg-gold/10">
              View storefront
            </Link>
          </div>
          <nav className="mt-5 flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-gold/20 bg-ivory px-3 py-2 text-sm font-medium text-charcoal transition hover:border-gold hover:bg-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
