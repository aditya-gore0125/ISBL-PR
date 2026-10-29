import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { normalizePhone } from '@/lib/phone';
import { applyRateLimit } from '@/lib/rateLimit';
import { credentialFormSchema } from '@/lib/schemas';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);

export { handler as GET };

export async function POST(request, context) {
	if (new URL(request.url).pathname.endsWith('/callback/credentials')) {
		let form;
		try {
			form = Object.fromEntries(await request.clone().formData());
		} catch {
			return NextResponse.json({ message: 'Invalid credentials request.' }, { status: 400 });
		}

		const rawEmail = typeof form.email === 'string' ? form.email : '';
		const normalizedIdentity = rawEmail ? (normalizePhone(rawEmail) || String(rawEmail).trim().toLowerCase()) : '';

		const rateLimitResponse = await applyRateLimit(request, {
			route: 'auth-credentials',
			limit: 10,
			windowMs: 10 * 60 * 1000,
			identity: normalizedIdentity,
		});
		if (rateLimitResponse) return rateLimitResponse;

		const parsed = credentialFormSchema.safeParse(form);
		if (!parsed.success) {
			return NextResponse.json({ message: 'Invalid credentials request.' }, { status: 400 });
		}
	}

	return handler(request, context);
}
