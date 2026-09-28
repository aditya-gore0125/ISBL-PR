import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-4 py-16 text-center">
      <div className="max-w-lg rounded-[1.5rem] border border-gold/15 bg-white/80 p-10 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gold">Nandini Jewellers</p>
        <h1 className="mt-4 font-fraunces text-5xl text-charcoal">Nothing here yet</h1>
        <p className="mt-4 leading-7 text-charcoal/70">That page has moved or the piece is no longer available.</p>
        <Link href="/" className="mt-8 inline-flex rounded-[0.95rem] bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-gold-dark">Return home</Link>
      </div>
    </main>
  );
}
