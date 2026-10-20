export function getAuthSecret() {
  const configuredSecret = process.env.NEXTAUTH_SECRET;

  if (!configuredSecret || configuredSecret.trim().length < 32) {
    throw new Error('NEXTAUTH_SECRET must be set to a secret at least 32 characters long in every environment.');
  }

  return configuredSecret;
}