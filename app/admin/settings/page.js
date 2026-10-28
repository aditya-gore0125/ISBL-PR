'use client';

import { useEffect, useRef, useState } from 'react';
import SafeImage from '@/components/SafeImage';

export default function AdminSettingsPage() {
  const [currentLogo, setCurrentLogo] = useState('/logo.svg');
  const [loading, setLoading] = useState(true);
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/logo');
      const data = await response.json();
      if (response.ok && data?.logoUrl) {
        setCurrentLogo(data.logoUrl);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploadError('');
    setSuccessMessage('');

    // Max 2 MB
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File must be 2 MB or smaller.');
      return;
    }

    // Allowed types: PNG, JPG, WEBP, SVG
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    const isAllowedExt = /\.(png|jpe?g|webp|svg)$/i.test(file.name);
    if (!allowedTypes.includes(file.type) && !isAllowedExt) {
      setUploadError('Only PNG, JPG, WEBP, or SVG files are supported.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Upload failed.');
      }

      setUploadedLogo({
        secure_url: data.secure_url,
        public_id: data.public_id || '',
      });
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Unable to upload logo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveLogo = async () => {
    if (!uploadedLogo) return;

    setSaving(true);
    setUploadError('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/admin/settings/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoUrl: uploadedLogo.secure_url,
          logoPublicId: uploadedLogo.public_id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Unable to save logo.');
      }

      setCurrentLogo(data.logoUrl);
      setUploadedLogo(null);
      setSuccessMessage('Logo saved successfully! Storefront has been revalidated.');
    } catch (err) {
      console.error('Save logo error:', err);
      setUploadError(err.message || 'Unable to save logo.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = async () => {
    const confirmed = window.confirm('Reset logo to default (/logo.svg)?');
    if (!confirmed) return;

    setSaving(true);
    setUploadError('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/admin/settings/logo', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Unable to reset logo.');
      }

      setCurrentLogo('/logo.svg');
      setUploadedLogo(null);
      setSuccessMessage('Logo reset to default (/logo.svg). Storefront has been revalidated.');
    } catch (err) {
      console.error('Reset logo error:', err);
      setUploadError(err.message || 'Unable to reset logo.');
    } finally {
      setSaving(false);
    }
  };

  const previewLogoUrl = uploadedLogo ? uploadedLogo.secure_url : currentLogo;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Configuration</p>
        <h2 className="mt-2 font-fraunces text-3xl text-charcoal">Site settings</h2>
      </div>

      {successMessage ? (
        <div className="rounded-[1rem] border border-gold/40 bg-gold/10 p-4 text-sm font-semibold text-charcoal">
          ✓ {successMessage}
        </div>
      ) : null}

      {uploadError ? (
        <div className="rounded-[1rem] border border-maroon/30 bg-maroon/10 p-4 text-sm font-semibold text-maroon">
          ✕ {uploadError}
        </div>
      ) : null}

      <div className="rounded-[1.5rem] border border-gold/15 bg-white p-6 shadow-soft">
        <h3 className="font-fraunces text-xl text-charcoal">Main Logo</h3>
        <p className="mt-1 text-sm text-charcoal/70">
          Upload a custom logo for the header, footer, and brand presentation across the site. Supported: PNG, JPG, WEBP, SVG (max 2 MB).
        </p>

        {loading ? (
          <div className="py-8 text-sm text-charcoal/60">Loading settings…</div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Logo previews on ivory and charcoal */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-charcoal/70">
                {uploadedLogo ? 'Preview (Unsaved Upload)' : 'Current Logo Preview'}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col items-center justify-center rounded-2xl border border-gold/20 bg-ivory p-6">
                  <span className="mb-4 text-xs font-semibold uppercase tracking-wider text-charcoal/50">Ivory Background (Light)</span>
                  <div className="flex h-16 w-full items-center justify-center">
                    <SafeImage
                      src={previewLogoUrl}
                      alt="Logo preview on ivory"
                      width={180}
                      height={48}
                      sizes="180px"
                      className="max-h-12 w-auto object-contain"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center rounded-2xl border border-charcoal bg-charcoal p-6 text-white">
                  <span className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/50">Charcoal Background (Dark)</span>
                  <div className="flex h-16 w-full items-center justify-center">
                    <SafeImage
                      src={previewLogoUrl}
                      alt="Logo preview on charcoal"
                      width={180}
                      height={48}
                      sizes="180px"
                      className="max-h-12 w-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Upload controls */}
            <div className="border-t border-gold/15 pt-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileChange}
                className="sr-only"
                aria-label="Upload logo file"
              />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={uploading || saving}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full border border-gold/30 bg-gold/10 px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? 'Uploading…' : 'Upload new logo'}
                </button>

                <button
                  type="button"
                  disabled={!uploadedLogo || saving || uploading}
                  onClick={handleSaveLogo}
                  className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save logo'}
                </button>

                <button
                  type="button"
                  disabled={saving || uploading}
                  onClick={handleResetDefault}
                  className="rounded-full border border-maroon/20 bg-maroon/5 px-4 py-2.5 text-sm font-semibold text-maroon transition hover:bg-maroon/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reset to default
                </button>

                {uploadedLogo ? (
                  <button
                    type="button"
                    onClick={() => setUploadedLogo(null)}
                    className="text-xs text-charcoal/60 hover:text-charcoal"
                  >
                    Cancel upload
                  </button>
                ) : null}
              </div>

              {uploadedLogo ? (
                <p className="mt-3 text-xs text-gold-dark font-medium">
                  New logo ready to save: {uploadedLogo.secure_url}
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

