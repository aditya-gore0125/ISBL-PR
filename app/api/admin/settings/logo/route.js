import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';
import { deleteImage } from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/requireAdmin';

export const runtime = 'nodejs';

const logoSettingsSchema = z.object({
  logoUrl: z
    .string()
    .url()
    .refine((url) => /^https:\/\/res\.cloudinary\.com\//.test(url), {
      message: 'Logo URL must be an HTTPS URL on res.cloudinary.com',
    }),
  logoPublicId: z.string().optional().default(''),
});

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    await connectToDatabase();
    const settings = await SiteSettings.findOne().lean();
    return NextResponse.json({
      logoUrl: settings?.logoUrl || '/logo.svg',
      logoPublicId: settings?.logoPublicId || '',
    });
  } catch (error) {
    console.error('Get logo settings error:', error);
    return NextResponse.json({ message: 'Unable to load logo settings.' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const json = await request.json();
    const normalizedBody = {
      logoUrl: json.logoUrl || json.secure_url,
      logoPublicId: json.logoPublicId || json.public_id || '',
    };
    const parsed = logoSettingsSchema.safeParse(normalizedBody);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues?.[0]?.message || 'Invalid logo URL.' },
        { status: 400 }
      );
    }

    const { logoUrl, logoPublicId } = parsed.data;

    await connectToDatabase();
    const updated = await SiteSettings.findOneAndUpdate(
      {},
      {
        $set: {
          logoUrl,
          logoPublicId,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    revalidatePath('/', 'layout');
    revalidateTag('site-settings');

    return NextResponse.json({
      logoUrl: updated.logoUrl,
      logoPublicId: updated.logoPublicId,
    });
  } catch (error) {
    console.error('Save logo settings error:', error);
    return NextResponse.json({ message: 'Unable to save logo settings.' }, { status: 500 });
  }
}

export async function DELETE() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    await connectToDatabase();
    const current = await SiteSettings.findOne();
    if (current?.logoPublicId) {
      try {
        await deleteImage(current.logoPublicId);
      } catch (err) {
        console.error('Error deleting previous Cloudinary logo asset:', err);
      }
    }

    const updated = await SiteSettings.findOneAndUpdate(
      {},
      {
        $set: {
          logoUrl: '/logo.svg',
          logoPublicId: '',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    revalidatePath('/', 'layout');
    revalidateTag('site-settings');

    return NextResponse.json({
      logoUrl: updated.logoUrl,
      logoPublicId: '',
    });
  } catch (error) {
    console.error('Reset logo settings error:', error);
    return NextResponse.json({ message: 'Unable to reset logo settings.' }, { status: 500 });
  }
}

