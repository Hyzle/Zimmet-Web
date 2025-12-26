import { getPool, sql } from './db.js';
import bcrypt from 'bcryptjs';

async function upsertUser({ id, name, email, role, password }) {
  const pool = await getPool();
  const hash = await bcrypt.hash(password, 10);
  const exists = (
    await pool
      .request()
      .input('email', sql.NVarChar(200), email)
      .query('SELECT COUNT(1) as c FROM Users WHERE email=@email')
  ).recordset[0].c > 0;

  if (!exists) {
    await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .input('name', sql.NVarChar(200), name)
      .input('email', sql.NVarChar(200), email)
      .input('role', sql.NVarChar(20), role)
      .input('passwordHash', sql.NVarChar(200), hash)
      .query('INSERT INTO Users (id, name, email, role, passwordHash) VALUES (@id, @name, @email, @role, @passwordHash)');
    console.log(`Created user ${email}`);
  } else {
    await pool
      .request()
      .input('name', sql.NVarChar(200), name)
      .input('role', sql.NVarChar(20), role)
      .input('passwordHash', sql.NVarChar(200), hash)
      .input('email', sql.NVarChar(200), email)
      .query('UPDATE Users SET name=@name, role=@role, passwordHash=@passwordHash WHERE email=@email');
    console.log(`Updated user ${email}`);
  }
}

async function main() {
  try {
    await upsertUser({
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      name: 'Admin',
      email: 'admin@zimmet.local',
      role: 'admin',
      password: 'Admin123!'
    });
    await upsertUser({
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      name: 'User',
      email: 'user@zimmet.local',
      role: 'user',
      password: 'User123!'
    });
    console.log('Seed finished.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
