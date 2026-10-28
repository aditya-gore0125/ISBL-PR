import { unstable_cache } from 'next/cache';
import connectToDatabase from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';

export const getSiteSettings = unstable_cache(
  async () => {
    try {
      await connectToDatabase();
      const settings = await SiteSettings.findOne().lean();
      return {
        logoUrl: settings?.logoUrl || '/logo.svg',
        logoPublicId: settings?.logoPublicId || '',
      };
    } catch (error) {
      console.error('Error loading site settings:', error);
      return {
        logoUrl: '/logo.svg',
        logoPublicId: '',
      };
    }
  },
  ['site-settings'],
  { tags: ['site-settings'] }
);

