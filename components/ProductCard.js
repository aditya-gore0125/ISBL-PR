export default function ProductCard({ product }) {
  const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80';
  const hasDiscount = Number(product.discountPrice) > 0 && Number(product.discountPrice) < Number(product.price);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-gold/15 bg-white/80 shadow-soft transition duration-300 hover:-translate-y-1">
      <div className="image-shimmer relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-blush/30 via-ivory to-gold/10">
        <img src={imageUrl} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-gold">{product.category}</p>
        <h3 className="mt-2 font-fraunces text-xl text-charcoal">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-charcoal/70">{product.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            {hasDiscount ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-charcoal/60 line-through">₹{product.price}</span>
                <span className="font-fraunces text-lg text-maroon">₹{product.discountPrice}</span>
              </div>
            ) : (
              <span className="font-fraunces text-lg text-charcoal">₹{product.price}</span>
            )}
          </div>
          <button type="button" className="rounded-full border border-gold/20 bg-gold px-3 py-2 text-sm font-semibold text-white transition hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
