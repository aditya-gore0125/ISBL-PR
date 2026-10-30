'use client';

import { useState } from 'react';
import SafeImage from '@/components/SafeImage';

export default function ProductGallery({ images = [], alt = 'Jewelry product' }) {
  const safeImages = images.filter(Boolean);
  const displayImages = safeImages.length ? safeImages : ['/category-placeholder.svg'];
  const [activeImage, setActiveImage] = useState(displayImages[0]);

  return (
    <div className="rounded-[1.4rem] border border-gold/15 bg-white/70 p-4 shadow-soft">
      <div className="image-shimmer overflow-hidden rounded-[1.1rem] border border-gold/15 bg-gradient-to-br from-blush/30 via-ivory to-gold/10">
        <SafeImage src={activeImage} alt={alt} width={900} height={1125} sizes="(max-width: 1023px) 100vw, 50vw" priority className="aspect-[4/5] w-full object-cover" />
      </div>
      {safeImages.length > 0 ? (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {safeImages.map((image) => {
            const isActive = image === activeImage;
            return (
              <button
                key={image}
                type="button"
                onClick={() => setActiveImage(image)}
                className={`overflow-hidden rounded-[0.85rem] border ${isActive ? 'border-gold shadow-sm' : 'border-gold/15'} bg-white/80`}
              >
                <SafeImage src={image} alt={`${alt} thumbnail`} width={220} height={220} sizes="(max-width: 1023px) 25vw, 12vw" className="aspect-square w-full object-cover" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
