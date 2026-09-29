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

export default function SafeImage({ src, alt, unoptimized, ...props }) {
  return <Image {...props} src={src} alt={alt} unoptimized={Boolean(unoptimized || shouldSkipOptimization(src))} />;
}