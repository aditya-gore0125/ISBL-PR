import connectToDatabase from '@/lib/mongodb';
import { applyRateLimit } from '@/lib/rateLimit';
import { contactSchema } from '@/lib/schemas';
import { validateJsonRequest } from '@/lib/validateRequest';
import ContactInquiry from '@/models/ContactInquiry';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const rateLimitResponse = await applyRateLimit(request, {
    route: 'contact',
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (rateLimitResponse) return rateLimitResponse;

  const { data, response } = await validateJsonRequest(request, contactSchema);
  if (response) return response;

  try {
    await connectToDatabase();
    await ContactInquiry.create({ ...data, subject: data.subject || 'General Inquiry' });

    return Response.json({
      success: true,
      message: 'Thank you for reaching out! Your message has been received and our concierge team will get back to you within 24 hours.',
    }, { status: 201 });
  } catch (error) {
    console.error('Contact inquiry persistence failed', {
      name: error?.name || 'UnknownError',
      code: error?.code || 'unknown',
    });
    return Response.json({ message: 'Unable to save your inquiry. Please try again later.' }, { status: 500 });
  }
}
