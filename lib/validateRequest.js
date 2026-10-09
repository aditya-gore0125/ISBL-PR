import { NextResponse } from 'next/server';

export async function validateJsonRequest(request, schema) {
  let body;
  try {
    body = await request.json();
  } catch {
    return {
      data: null,
      response: NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 }),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      data: null,
      response: NextResponse.json({
        message: result.error.issues[0]?.message || 'Request body is invalid.',
      }, { status: 400 }),
    };
  }

  return { data: result.data, response: null };
}