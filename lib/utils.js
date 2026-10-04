export function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function formatOrderId(value) {
  const id = value && typeof value === 'object' && '_id' in value ? value._id : value;
  const text = String(id || '');
  return text ? `#${text.slice(-6).toUpperCase()}` : '#';
}