'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Storefront route error:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-4 py-16 text-center">
      <div className="max-w-lg rounded-[1.5rem] border border-gold/15 bg-white/80 p-10 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gold">Nandini Jewellers</p>
        <h1 className="mt-4 font-fraunces text-4xl text-charcoal">A momentary interruption</h1>
        <p className="mt-4 leading-7 text-charcoal/70">We could not load this page right now. Please try again.</p>
        <button type="button" onClick={() => reset()} className="mt-8 rounded-[0.95rem] bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-gold-dark">Try again</button>
      </div>
    </main>
  );
}
