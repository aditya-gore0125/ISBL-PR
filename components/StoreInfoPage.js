export default function StoreInfoPage({ eyebrow, title, intro, children }) {
  return (
    <main className="min-h-screen bg-ivory">
      <header className="border-b border-gold/15 bg-gradient-to-br from-white via-ivory to-blush/25">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
          <h1 className="mt-3 max-w-4xl font-fraunces text-4xl leading-tight text-charcoal sm:text-5xl">{title}</h1>
          {intro ? <p className="mt-5 max-w-3xl text-base leading-7 text-charcoal/75">{intro}</p> : null}
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="max-w-4xl space-y-8 text-base leading-7 text-charcoal/80">{children}</div>
      </div>
    </main>
  );
}