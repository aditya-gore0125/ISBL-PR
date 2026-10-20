import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import SafeImage from '@/components/SafeImage';

export default function ProductCard({ product }) {
  const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80';
  const hasDiscount = Number(product.discountPrice) > 0 && Number(product.discountPrice) < Number(product.price);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-gold/15 bg-white/80 shadow-soft transition duration-300 hover:-translate-y-1">
      <div className="image-shimmer relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-blush/30 via-ivory to-gold/10">
        <Link href={`/product/${product.slug}`} className="block h-full">
          <SafeImage src={imageUrl} alt={product.name} width={900} height={1125} sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        </Link>
        {hasDiscount ? <span className="absolute left-3 top-3 rounded-full bg-maroon px-3 py-1 text-xs font-semibold uppercase text-white">Sale</span> : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-gold">{product.category}</p>
        <h3 className="mt-2 font-fraunces text-xl text-charcoal">
          <Link href={`/product/${product.slug}`} className="inline-flex min-h-11 items-center transition hover:text-gold-dark">{product.name}</Link>
        </h3>
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
          <AddToCartButton
            productId={String(product._id)}
            slug={String(product.slug)}
            name={String(product.name || '')}
            image={imageUrl}
            price={Number(hasDiscount ? product.discountPrice : product.price)}
            stock={Number(product.stock || 0)}
            sizes={product.sizes || []}
          />
        </div>
      </div>
    </article>
  );
}
