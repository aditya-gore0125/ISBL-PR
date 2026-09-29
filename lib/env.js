export function getAuthSecret() {
  const secret = process.env.NEXTAUTH_SECRET;

  if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) {
    throw new Error('NEXTAUTH_SECRET must be set to at least 32 characters in production.');
  }

  return secret;
}