export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl rounded-soft border border-gold/20 bg-white/80 p-6 shadow-soft">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">Signature jewelry for modern elegance</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Nandini Jewellers — refined fashion jewelry for every celebration.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-charcoal/80 sm:text-lg">
            Discover polished necklaces, earrings, rings and curated gifting collections designed with warm ivory, soft blush, and luminous gold details.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <button className="inline-flex items-center justify-center rounded-soft bg-gold px-6 py-3 text-sm font-semibold uppercase text-white transition hover:bg-gold-dark focus:outline-none focus:ring-2 focus:ring-gold-dark focus:ring-offset-2 focus:ring-offset-ivory">
              Shop new arrivals
            </button>
            <button className="inline-flex items-center justify-center rounded-soft border border-charcoal/10 bg-white px-6 py-3 text-sm font-semibold text-charcoal transition hover:border-charcoal focus:outline-none focus:ring-2 focus:ring-gold-dark focus:ring-offset-2 focus:ring-offset-ivory">
              Browse collections
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
