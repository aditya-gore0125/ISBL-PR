export const BANGLE_SIZES = ['2.2', '2.4', '2.6', '2.8', '2.10'];
export const KADA_SIZES = ['2.6', '2.8', '2.10', '2.12'];
export const RING_SIZES = ['6', '7', '8', '9', '10'];

export function getSizeOptions(type, category) {
  const normalizedType = String(type || '').trim().toLowerCase();
  const normalizedCategory = String(category || '').trim().toLowerCase();

  if (normalizedCategory === 'bangles' && normalizedType === 'ladies') return BANGLE_SIZES;
  if (normalizedCategory === 'kada' && normalizedType === 'gents') return KADA_SIZES;
  if ((normalizedCategory === 'ring' || normalizedCategory === 'rings')
    && (normalizedType === 'ladies' || normalizedType === 'gents')) return RING_SIZES;
  return null;
}
