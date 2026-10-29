'use client';

import { useWishlist } from '@/lib/WishlistContext';

export default function WishlistButton({
  product,
  className = '',
  iconClassName = 'h-5 w-5',
}) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const rawId = product?.productId || product?._id;
  const active = rawId ? isWishlisted(rawId) : false;

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!product || !rawId) return;

    toggleWishlist({
      productId: String(rawId),
      slug: product.slug,
      name: product.name,
      image: product.image || product.images?.[0] || '/category-placeholder.svg',
      price: product.price,
      discountPrice: product.discountPrice,
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`${iconClassName} transition-colors ${
          active
            ? 'fill-maroon stroke-maroon text-maroon'
            : 'fill-transparent stroke-gold hover:stroke-gold-dark text-transparent'
        }`}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    </button>
  );
}

