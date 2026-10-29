import connectToDatabase from '../lib/mongodb.js';
import User from '../models/User.js';

function normalizePhone(input) {
  if (typeof input !== 'string' && typeof input !== 'number') return null;
  let digits = String(input).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  if (/^[6-9]\d{9}$/.test(digits)) {
    return digits;
  }
  return null;
}

function maskPhone(phone) {
  if (!phone) return '';
  const str = String(phone);
  if (str.length <= 4) return '***' + str;
  return '*'.repeat(Math.max(0, str.length - 4)) + str.slice(-4);
}

async function run() {
  const conn = await connectToDatabase();
  console.log('mongoose.connection.name:', conn.name);

  const uri = process.env.MONGODB_URI;
  const configuredDatabase = uri ? new URL(uri).pathname.replace(/^\/|\/$/g, '') || 'jewelry-store' : '';
  console.log('configuredDatabase from URI:', configuredDatabase);

  if (configuredDatabase && conn.name !== configuredDatabase) {
    console.error(`STOP CONDITION A: connection name "${conn.name}" does not match configured database "${configuredDatabase}"`);
  }

  try {
    const users = await User.find({}).lean();
    const indexes = await User.collection.indexes();

    let usersTotal = users.length;
    let usersWithPhone = 0;
    let phonesAlreadyClean = 0;
    let phonesNeedingNormalization = [];
    let normalizedPhoneMap = new Map();
    let usersWithUppercaseEmail = 0;

    for (const u of users) {
      if (u.email && /[A-Z]/.test(u.email)) {
        usersWithUppercaseEmail++;
      }

      const rawPhone = u.phone ? String(u.phone).trim() : '';
      if (rawPhone) {
        usersWithPhone++;
        if (/^[6-9]\d{9}$/.test(rawPhone)) {
          phonesAlreadyClean++;
        } else {
          phonesNeedingNormalization.push({
            userId: u._id.toString(),
            rawMasked: maskPhone(rawPhone),
            normalized: normalizePhone(rawPhone) ? maskPhone(normalizePhone(rawPhone)) : 'INVALID',
          });
        }

        const norm = normalizePhone(rawPhone);
        if (norm) {
          if (!normalizedPhoneMap.has(norm)) {
            normalizedPhoneMap.set(norm, []);
          }
          normalizedPhoneMap.get(norm).push(u._id.toString());
        }
      }
    }

    const duplicatePhones = [];
    for (const [norm, ids] of normalizedPhoneMap.entries()) {
      if (ids.length > 1) {
        duplicatePhones.push({
          maskedPhone: maskPhone(norm),
          count: ids.length,
        });
      }
    }

    const phoneIndexes = indexes.filter(idx => idx.key && idx.key.phone);

    console.log('\n--- AUDIT RESULTS ---');
    console.log(JSON.stringify({
      connectionName: conn.name,
      configuredDatabase,
      usersTotal,
      usersWithPhone,
      phonesAlreadyClean,
      phonesNeedingNormalization,
      duplicatePhones,
      usersWithUppercaseEmail,
      phoneIndexes,
    }, null, 2));

  } finally {
    await conn.close();
  }
}

run().catch((err) => {
  console.error('Check failed:', err);
  process.exit(1);
});

