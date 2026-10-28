import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema(
  {
    logoUrl: {
      type: String,
      default: '/logo.svg',
    },
    logoPublicId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);
export default SiteSettings;

