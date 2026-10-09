import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/requireAdmin';
import ContactInquiry from '@/models/ContactInquiry';

export const dynamic = 'force-dynamic';

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
                      <a className="hover:text-gold-dark" href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                      {inquiry.phone ? ` · ${inquiry.phone}` : ''}
                    </p>
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
