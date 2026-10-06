import { NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { applyRateLimit } from '@/lib/rateLimit';
import { requireAdmin } from '@/lib/requireAdmin';
import { uploadSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

export async function POST(request) {
  const rateLimitResponse = await applyRateLimit(request, { route: 'admin-upload', limit: 20, windowMs: 10 * 60 * 1000 });
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const entries = Array.from(formData.keys());
    const parsed = uploadSchema.safeParse({ image });
    if (!parsed.success || entries.length !== 1 || entries[0] !== 'image') {
      return NextResponse.json({ message: 'An image file is required.' }, { status: 400 });
    }

    if (!image.type?.startsWith('image/')) {
      return NextResponse.json({ message: 'Only image files are supported.' }, { status: 400 });
    }

    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: 'Images must be 10 MB or smaller.' }, { status: 400 });
    }

    const result = await uploadImage(Buffer.from(await image.arrayBuffer()));
    return NextResponse.json({ secure_url: result.secure_url }, { status: 201 });
  } catch (error) {
    console.error('Admin image upload error', error);
    return NextResponse.json({ message: error.message || 'Unable to upload image.' }, { status: 500 });
  }
}
