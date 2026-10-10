import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ContactInquiry from '@/models/ContactInquiry';
import { requireAdmin } from '@/lib/requireAdmin';

export const dynamic = 'force-dynamic';

// GET /api/admin/inquiries — list all contact messages
export async function GET(request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  await dbConnect();
  const inquiries = await ContactInquiry.find({})
    .sort({ createdAt: -1 })  // newest first
    .lean();

  return NextResponse.json({ inquiries });
}

// PATCH /api/admin/inquiries?id=xxx — mark as read
export async function PATCH(request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

  await dbConnect();
  await ContactInquiry.findByIdAndUpdate(id, { read: true });
  return NextResponse.json({ success: true });
}

// DELETE /api/admin/inquiries?id=xxx — delete one inquiry
export async function DELETE(request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

  await dbConnect();
  await ContactInquiry.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}

