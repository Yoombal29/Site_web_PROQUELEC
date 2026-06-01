// Seed users — Admin + demo users
'use strict';

const bcrypt = require('bcrypt');
const { upsert, getPool, closePool } = require('./seed-utils.cjs');

const ADMIN_ID = 'a0000000-0000-0000-0000-000000000001';
const USER_ID = 'a0000000-0000-0000-0000-000000000002';

async function seed() {
  console.log('[seed] 👤 Users...');

  const passwordHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  const admin = await upsert('users', {
    id: ADMIN_ID,
    name: 'Admin PROQUELEC',
    email: 'admin@proquelec.sn',
    password_hash: passwordHash,
    role: 'admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  });
  console.log(`  ✅ Admin: ${admin.email} (password: admin123)`);

  const user = await upsert('users', {
    id: USER_ID,
    name: 'Client Demo',
    email: 'client@proquelec.sn',
    password_hash: userHash,
    role: 'user',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  });
  console.log(`  ✅ User: ${user.email} (password: user123)`);

  return { adminId: ADMIN_ID, userId: USER_ID };
}

module.exports = { seed };
