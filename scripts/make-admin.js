import connectToDatabase from '../lib/mongodb.js';
import User from '../models/User.js';

async function makeAdmin() {
  const email = (process.argv[2] || '').trim().toLowerCase();
  if (!email) throw new Error('Usage: npm run make-admin -- <email>');

  const connection = await connectToDatabase();
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { role: 'admin' } },
      { new: true, runValidators: true }
    ).select('email').lean();

    if (!user) throw new Error(`No user found with email ${email}.`);
    console.log(`${user.email} is now an admin. Please log out and log in again.`);
  } finally {
    await connection.close();
  }
}

makeAdmin().catch((error) => {
  console.error('Unable to make user an admin.', error);
  process.exitCode = 1;
});