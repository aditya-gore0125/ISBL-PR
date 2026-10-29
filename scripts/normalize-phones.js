import connectToDatabase from '../lib/mongodb.js';
import User from '../models/User.js';
import { normalizePhone } from '../lib/phone.js';

function maskPhone(phone) {
  if (!phone) return '';
  const str = String(phone);
  if (str.length <= 4) return '***' + str;
  return '*'.repeat(Math.max(0, str.length - 4)) + str.slice(-4);
}

async function run() {
  const isApply = process.argv.includes('--apply');
  console.log(isApply ? '=== RUNNING IN APPLY MODE ===' : '=== RUNNING IN DRY-RUN MODE (default) ===');
  if (!isApply) {
    console.log('Pass --apply to persist changes to the database.\n');
  }

  const conn = await connectToDatabase();
  console.log('Connected to database:', conn.name);

  try {
    const users = await User.find({ phone: { $exists: true, $ne: '' } }).lean();

    let totalWithPhone = users.length;
    let alreadyClean = 0;
    let wouldNormalize = 0;
    let collisionsSkipped = 0;
    let invalidSkipped = 0;

    // Track all phones currently in DB to detect collisions
    const existingPhones = new Map();
    for (const u of users) {
      if (u.phone) {
        existingPhones.set(String(u.phone).trim(), u._id.toString());
      }
    }

    const targetNormToUser = new Map();

    for (const u of users) {
      const raw = String(u.phone).trim();
      if (/^[6-9]\d{9}$/.test(raw)) {
        alreadyClean++;
        targetNormToUser.set(raw, u._id.toString());
        continue;
      }

      const normalized = normalizePhone(raw);
      if (!normalized) {
        invalidSkipped++;
        console.warn(`[INVALID] User ${u._id} has invalid phone format: "${maskPhone(raw)}" (skipped)`);
        continue;
      }

      // Check collision
      const existingOwner = existingPhones.get(normalized) || targetNormToUser.get(normalized);
      if (existingOwner && existingOwner !== u._id.toString()) {
        collisionsSkipped++;
        console.warn(`[COLLISION SKIP] User ${u._id} phone "${maskPhone(raw)}" -> "${maskPhone(normalized)}" collides with user ${existingOwner}`);
        continue;
      }

      targetNormToUser.set(normalized, u._id.toString());
      wouldNormalize++;

      if (isApply) {
        await User.updateOne({ _id: u._id }, { $set: { phone: normalized } });
        console.log(`[UPDATED] User ${u._id}: "${maskPhone(raw)}" -> "${maskPhone(normalized)}"`);
      } else {
        console.log(`[DRY-RUN] User ${u._id}: would update "${maskPhone(raw)}" -> "${maskPhone(normalized)}"`);
      }
    }

    console.log('\n--- NORMALIZATION SUMMARY ---');
    console.table({
      mode: isApply ? 'APPLY' : 'DRY-RUN',
      totalWithPhone,
      alreadyClean,
      wouldNormalize,
      collisionsSkipped,
      invalidSkipped,
    });
  } finally {
    await conn.close();
  }
}

run().catch((err) => {
  console.error('Normalization error:', err);
  process.exitCode = 1;
});

