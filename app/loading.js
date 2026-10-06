function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-[1rem] bg-gold/10 ${className}`} />;
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-ivory px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 w-full rounded-[1.5rem]" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-80" />)}
        </div>
      </div>
    </main>
  );
}
