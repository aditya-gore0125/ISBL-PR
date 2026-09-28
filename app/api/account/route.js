import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ADDRESS_FIELDS = [
  'fullName',
  'phone',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'pincode',
  'isDefault',
];

function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    addresses: user.addresses || [],
  };
}

function validateAddresses(addresses) {
  if (!Array.isArray(addresses) || addresses.length > 10) return null;

  const normalized = [];
  for (const address of addresses) {
    if (!address || typeof address !== 'object' || Array.isArray(address)) return null;

    const cleanAddress = {};
    for (const field of ADDRESS_FIELDS) {
      if (field === 'isDefault') continue;
      const value = address[field];
      if (field === 'addressLine2' && value === undefined) {
        cleanAddress[field] = '';
      } else if (typeof value !== 'string') {
        return null;
      } else {
        cleanAddress[field] = value.trim();
      }
    }

    const requiredFields = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    if (requiredFields.some((field) => !cleanAddress[field])) return null;
    if (cleanAddress.fullName.length > 100 || cleanAddress.addressLine1.length > 200
      || cleanAddress.addressLine2.length > 200 || cleanAddress.city.length > 100
      || cleanAddress.state.length > 100) return null;
    if (!/^[6-9]\d{9}$/.test(cleanAddress.phone) || !/^[1-9][0-9]{5}$/.test(cleanAddress.pincode)) return null;

    if (address.isDefault !== undefined && typeof address.isDefault !== 'boolean') return null;
    cleanAddress.isDefault = address.isDefault === true;
    normalized.push(cleanAddress);
  }

  return normalized.filter((address) => address.isDefault).length <= 1 ? normalized : null;
}

async function getAuthenticatedSession() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? session : null;
}

export async function GET() {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id).lean();

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    console.error('Account GET error', error);
    return NextResponse.json({ message: 'Unable to load account right now.' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 });
    }

    const update = {};
    if (body?.profile !== undefined) {
      const name = String(body.profile?.name || '').trim();
      const phone = String(body.profile?.phone || '').trim();

      if (name.length < 2 || name.length > 100 || phone.length > 20) {
        return NextResponse.json({ message: 'Enter a valid name and phone number.' }, { status: 400 });
      }

      update.name = name;
      update.phone = phone;
    }

    if (body?.addresses !== undefined) {
      const addresses = validateAddresses(body.addresses);
      if (!addresses) {
        return NextResponse.json({ message: 'Invalid addresses payload.' }, { status: 400 });
      }

      update.addresses = addresses;
    }

    if (!Object.keys(update).length) {
      return NextResponse.json({ message: 'No account changes were provided.' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Account updated successfully.', user: serializeUser(user) });
  } catch (error) {
    console.error('Account PUT error', error);
    return NextResponse.json({ message: 'Unable to update account right now.' }, { status: 500 });
  }
}

function methodNotAllowed() {
  return NextResponse.json({ message: 'Method not allowed.' }, { status: 405 });
}

export async function POST() {
  return methodNotAllowed();
}

export async function PATCH() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

export async function OPTIONS() {
  return methodNotAllowed();
}
