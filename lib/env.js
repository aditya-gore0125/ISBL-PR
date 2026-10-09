export function getAuthSecret() {
  const configuredSecret = process.env.NEXTAUTH_SECRET;

  if (process.env.NODE_ENV === 'production') {
    if (!configuredSecret || configuredSecret.trim().length < 32) {
      throw new Error('NEXTAUTH_SECRET must be explicitly set to at least 32 characters in production.');
    }
    return configuredSecret;
  }

  return configuredSecret || 'dev-nextauth-secret-super-secure-32-chars-long';
}