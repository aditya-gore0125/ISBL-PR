export function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function sanitizeRedirectPath(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return '/';
  }
  return value;
}

export function formatOrderId(value) {
  const id = value && typeof value === 'object' && '_id' in value ? value._id : value;
  const text = String(id || '');
  return text ? `#${text.slice(-6).toUpperCase()}` : '#';
}