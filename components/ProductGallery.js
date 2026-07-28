'use client';

import { useState } from 'react';

export default function ProductGallery({ images = [], alt = 'Jewelry product' }) {
  const [activeImage, setActiveImage] = useState(images[0] || '');

  const safeImages = images.filter(Boolean);

  if (!safeImages.length) {
    return (
      <div className="overflow-hidden rounded-[1.4rem] border border-gold/15 bg-gradient-to-br from-blush/30 via-ivory to-gold/10 p-6">
        <div className="aspect-[4/5] rounded-[1rem] border border-dashed border-gold/20 bg-white/70" />
      </div>
    );
  }

  return (
    <div className="rounded-[1.4rem] border border-gold/15 bg-white/70 p-4 shadow-soft">
      <div className="image-shimmer overflow-hidden rounded-[1.1rem] border border-gold/15 bg-gradient-to-br from-blush/30 via-ivory to-gold/10">
        <img src={activeImage} alt={alt} className="aspect-[4/5] w-full object-cover" />
      </div>
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
              <img src={image} alt={`${alt} thumbnail`} className="aspect-square w-full object-cover" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
