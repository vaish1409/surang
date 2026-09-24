// server/scripts/createAdmin.js
//
// Creates an admin account. Safe to run more than once — if the email
// already exists, it just promotes that account to admin instead of
// creating a duplicate.
//
// Usage (from the server/ folder):
//   node scripts/createAdmin.js admin@surang.app "SomeStrongPassword123"
//
// Runs against whichever MONGO_URI is in your .env at the time — so run
// this locally against your LOCAL .env for local testing, and separately
// against your PRODUCTION .env (or paste the prod MONGO_URI in temporarily)
// to create the real admin account judges/you will actually use.

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  const [, , email, password] = process.argv;

  if (!email || !password) {
    console.error('Usage: node scripts/createAdmin.js <email> <password>');
    process.exit(1);
  }
  if (password.length < 6) {
    console.error('Password must be at least 6 characters.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  let user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    user.role = 'admin';
    await user.save();
    console.log(`Existing user ${email} promoted to admin.`);
  } else {
    user = await User.create({
      name: 'Admin',
      email,
      password, // hashed automatically by the User model's pre-save hook
      role: 'admin',
    });
    console.log(`New admin account created for ${email}.`);
  }

  await mongoose.disconnect();
  console.log('Done. You can now log in at /admin/login with this email and password.');
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
