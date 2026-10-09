import connectToDatabase from '@/lib/mongodb';
import { contactInquirySchema } from '@/lib/schemas';
import { validateJsonRequest } from '@/lib/validateRequest';
import ContactInquiry from '@/models/ContactInquiry';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const { data, response } = await validateJsonRequest(request, contactInquirySchema);
  if (response) return response;

  try {
    await connectToDatabase();
    await ContactInquiry.create(data);

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
