import dbConnect from '@/lib/mongodb';
import ContactInquiry from '@/models/ContactInquiry';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !name.trim()) {
      return Response.json({ message: 'Name is required.' }, { status: 400 });
    }

    if (!email || !email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return Response.json({ message: 'A valid email address is required.' }, { status: 400 });
    }

    if (!message || !message.trim()) {
      return Response.json({ message: 'Message is required.' }, { status: 400 });
    }

    // Save to MongoDB
    await dbConnect();
    await ContactInquiry.create({
      name:    name.trim(),
      email:   email.trim(),
      phone:   phone ? phone.trim() : '',
      subject: subject || 'General Inquiry',
      message: message.trim(),
    });

    console.log('Contact inquiry saved to DB from:', email.trim());

    return Response.json({
      success: true,
      message: 'Thank you for reaching out! Your message has been received and our concierge team will get back to you within 24 hours.',
    });
  } catch (error) {
    console.error('Contact API error', error);
    return Response.json({ message: 'Failed to process your request. Please try again later.' }, { status: 500 });
  }
}
