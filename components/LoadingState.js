export default function LoadingState({ label = 'Loading page' }) {
  return (
    <main aria-busy="true" aria-label={label} className="mx-auto min-h-[50vh] max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-6">
        <div className="h-5 w-32 rounded bg-gold/15" />
        <div className="h-10 max-w-xl rounded bg-charcoal/5" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="aspect-[4/3] rounded-xl bg-gold/10" />
          <div className="aspect-[4/3] rounded-xl bg-gold/10" />
          <div className="aspect-[4/3] rounded-xl bg-gold/10" />
        </div>
      </div>
      <span className="sr-only">{label}...</span>
    </main>
  );
}