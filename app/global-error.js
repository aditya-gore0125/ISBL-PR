'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Uncaught application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#FBF6EF', color: '#332822', fontFamily: 'sans-serif' }}>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem', textAlign: 'center' }}>
          <div>
            <p style={{ color: '#9C762E', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>Nandini Jewellers</p>
            <h1>Something went wrong.</h1>
            <p>We could not load this page right now. Please try again.</p>
            <button type="button" onClick={() => reset()} style={{ minHeight: 44, border: 0, borderRadius: 999, background: '#A9823B', color: '#fff', padding: '0 1.5rem', font: 'inherit', fontWeight: 700 }}>
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}