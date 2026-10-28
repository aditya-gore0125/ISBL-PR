'use client';

import { useState } from 'react';
import Image from 'next/image';

function shouldSkipOptimization(src) {
  if (typeof src !== 'string') return false;

  const path = src.split(/[?#]/, 1)[0];
  if (path.toLowerCase().endsWith('.svg')) return true;

  try {
    return new URL(src, 'http://localhost').hostname === 'placehold.co';
  } catch {
    return false;
  }
}

export default function SafeImage({ src, alt, unoptimized, hideOnError = false, onError, ...props }) {
  const [hasError, setHasError] = useState(false);

  if (hasError && hideOnError) {
    return null;
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      unoptimized={Boolean(unoptimized || shouldSkipOptimization(src))}
      onError={(event) => {
        setHasError(true);
        if (typeof onError === 'function') {
          onError(event);
        }
      }}
    />
  );
}
