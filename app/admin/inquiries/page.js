import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/requireAdmin';
import ContactInquiry from '@/models/ContactInquiry';

export const dynamic = 'force-dynamic';

function getWhatsAppUrl(phone) {
  const value = typeof phone === 'string' ? phone.trim() : '';
  if (!value.startsWith('+')) return null;
  const digits = value.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;
  const text = encodeURIComponent('Hello, I am following up on your inquiry to Nandini Jewellers.');
  return `https://wa.me/${digits}?text=${text}`;
}

export default async function AdminInquiriesPage() {
  const { response } = await requireAdmin();
  if (response) redirect('/login');

  let inquiries;
  try {
    inquiries = await ContactInquiry.find({}).sort({ createdAt: -1 }).limit(100).lean();
  } catch (error) {
    console.error('Admin inquiries read failed', {
      name: error?.name || 'UnknownError',
      code: error?.code || 'unknown',
    });
    throw error;
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Customer messages</p>
        <h2 className="mt-2 font-fraunces text-3xl text-charcoal">Inquiries</h2>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-gold/15 bg-white shadow-soft">
        {inquiries.length ? (
          <ul className="divide-y divide-gold/10">
            {inquiries.map((inquiry) => (
              <li key={String(inquiry._id)} className="space-y-3 p-5 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-charcoal">{inquiry.name}</h3>
                    <p className="text-sm text-charcoal/70">
                      <a className="hover:text-gold-dark" href={`mailto:${encodeURIComponent(inquiry.email)}`}>{inquiry.email}</a>
                      {inquiry.phone ? ` · ${inquiry.phone}` : ''}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
                      <a className="text-gold-dark hover:text-gold" href={`mailto:${encodeURIComponent(inquiry.email)}?subject=${encodeURIComponent(`Re: ${inquiry.subject}`)}`}>Reply by email</a>
                      {getWhatsAppUrl(inquiry.phone) ? (
                        <a
                          className="text-emerald-700 hover:text-emerald-800"
                          href={getWhatsAppUrl(inquiry.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Reply on WhatsApp
                        </a>
                      ) : null}
                      <span className={inquiry.isRead ? 'text-charcoal/55' : 'text-gold-dark'}>
                        {inquiry.isRead ? 'Read' : 'Unread'}
                      </span>
                    </div>
                  </div>
                  <time className="text-xs text-charcoal/55" dateTime={inquiry.createdAt.toISOString()}>
                    {inquiry.createdAt.toLocaleString('en-IN')}
                  </time>
                </div>
                <p className="text-sm font-medium text-gold-dark">{inquiry.subject}</p>
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-charcoal/80">{inquiry.message}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-6 text-sm text-charcoal/70">No inquiries have been received yet.</p>
        )}
      </div>
    </section>
  );
}
