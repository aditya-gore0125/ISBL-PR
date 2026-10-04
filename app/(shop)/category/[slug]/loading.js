export default function CategoryLoading() {
  return (
    <main className="min-h-screen bg-ivory px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="animate-pulse rounded-[1.5rem] bg-gold/10 p-8"><div className="h-8 w-56 rounded bg-gold/10" /><div className="mt-4 h-4 w-full max-w-xl rounded bg-gold/10" /></div>
        <div className="grid gap-6 lg:grid-cols-[16rem_1fr]"><div className="h-96 animate-pulse rounded-[1.25rem] bg-gold/10" /><div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-96 animate-pulse rounded-[1.25rem] bg-gold/10" />)}</div></div>
      </div>
    </main>
  );
}
