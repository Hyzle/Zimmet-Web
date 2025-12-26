import express from 'express';
import cors from 'cors';
import { getPool, sql } from './db.js';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));

// AUTH
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing_credentials' });
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('email', sql.NVarChar(200), email)
      .query('SELECT TOP 1 id, name, email, role, passwordHash FROM Users WHERE email=@email');
    const row = result.recordset[0];
    if (!row) return res.status(401).json({ error: 'invalid_credentials' });
    const ok = await bcrypt.compare(password, row.passwordHash || '');
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    // simple token placeholder
    const token = 'token-' + row.id;
    return res.json({
      token,
      user: { id: row.id, name: row.name, email: row.email, role: row.role },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'login_failed' });
  }
});

// USERS
app.get('/users', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT id, name, email, department, role FROM Users ORDER BY name');
    res.json(result.recordset);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'users_list_failed' });
  }
});

app.post('/users', async (req, res) => {
  const { name, email, department, password, role } = req.body;
  try {
    const pool = await getPool();
    if (!password) return res.status(400).json({ error: 'password_required' });
    const hash = await bcrypt.hash(password, 10);
    const result = await pool
      .request()
      .input('name', sql.NVarChar(200), name)
      .input('email', sql.NVarChar(200), email)
      .input('department', sql.NVarChar(200), department ?? null)
      .input('role', sql.NVarChar(20), role ?? 'user')
      .input('passwordHash', sql.NVarChar(200), hash)
      .query(`
        DECLARE @id UNIQUEIDENTIFIER = NEWID();
        INSERT INTO Users (id, name, email, department, role, passwordHash)
        VALUES (@id, @name, @email, @department, @role, @passwordHash);
        SELECT id, name, email, department, role FROM Users WHERE id = @id;
      `);
    res.status(201).json(result.recordset[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'user_create_failed' });
  }
});

app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, department, password, role } = req.body;
  try {
    const pool = await getPool();
    const reqst = pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .input('name', sql.NVarChar(200), name)
      .input('email', sql.NVarChar(200), email)
      .input('department', sql.NVarChar(200), department ?? null)
      .input('role', sql.NVarChar(20), role ?? 'user');
    let sqlText = 'UPDATE Users SET name=@name, email=@email, department=@department, role=@role';
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      reqst.input('passwordHash', sql.NVarChar(200), hash);
      sqlText += ', passwordHash=@passwordHash';
    }
    sqlText += ' WHERE id=@id';
    await reqst.query(sqlText);
    const result = await pool.request().input('id', sql.UniqueIdentifier, id).query('SELECT id, name, email, department, role FROM Users WHERE id=@id');
    res.json(result.recordset[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'user_update_failed' });
  }
});

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    await pool.request().input('id', sql.UniqueIdentifier, id).query('DELETE FROM Assignments WHERE userId=@id; DELETE FROM Users WHERE id=@id;');
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'user_delete_failed' });
  }
});

// ASSETS
app.get('/assets', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT id, name, model, serial, category FROM Assets ORDER BY name');
    res.json(result.recordset);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'assets_list_failed' });
  }
});

app.post('/assets', async (req, res) => {
  const { name, model, serial, category } = req.body;
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('name', sql.NVarChar(200), name)
      .input('model', sql.NVarChar(200), model)
      .input('serial', sql.NVarChar(200), serial)
      .input('category', sql.NVarChar(100), category)
      .query(`
        DECLARE @id UNIQUEIDENTIFIER = NEWID();
        INSERT INTO Assets (id, name, model, serial, category) VALUES (@id, @name, @model, @serial, @category);
        SELECT id, name, model, serial, category FROM Assets WHERE id=@id;
      `);
    res.status(201).json(result.recordset[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'asset_create_failed' });
  }
});

app.put('/assets/:id', async (req, res) => {
  const { id } = req.params;
  const { name, model, serial, category } = req.body;
  try {
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .input('name', sql.NVarChar(200), name)
      .input('model', sql.NVarChar(200), model)
      .input('serial', sql.NVarChar(200), serial)
      .input('category', sql.NVarChar(100), category)
      .query('UPDATE Assets SET name=@name, model=@model, serial=@serial, category=@category WHERE id=@id');
    const result = await pool.request().input('id', sql.UniqueIdentifier, id).query('SELECT id, name, model, serial, category FROM Assets WHERE id=@id');
    res.json(result.recordset[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'asset_update_failed' });
  }
});

app.delete('/assets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    await pool.request().input('id', sql.UniqueIdentifier, id).query('DELETE FROM Assignments WHERE assetId=@id; DELETE FROM Assets WHERE id=@id;');
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'asset_delete_failed' });
  }
});

// CATEGORIES
app.get('/categories', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT id, name FROM Categories ORDER BY name');
    res.json(result.recordset);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'categories_list_failed' });
  }
});

app.post('/categories', async (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name_required' });
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('name', sql.NVarChar(100), name)
      .query(`DECLARE @id UNIQUEIDENTIFIER = NEWID();
              INSERT INTO Categories (id, name) VALUES (@id, @name);
              SELECT id, name FROM Categories WHERE id=@id;`);
    res.status(201).json(result.recordset[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'category_create_failed' });
  }
});

app.delete('/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    await pool.request().input('id', sql.UniqueIdentifier, id).query('DELETE FROM Categories WHERE id=@id');
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'category_delete_failed' });
  }
});

// ASSIGNMENTS
app.get('/assignments', async (req, res) => {
  const { userId, category } = req.query;
  try {
    const pool = await getPool();
    const reqst = pool.request();
    // Always bind parameters to avoid 'Must declare scalar variable' when omitted
    reqst.input('userId', sql.UniqueIdentifier, userId || null);
    reqst.input('category', sql.NVarChar(100), category || null);
    const result = await reqst.query(`
      SELECT a.id, a.userId, a.assetId, a.assignedAt, a.note,
             u.name as userName, u.email as userEmail,
             s.name as assetName, s.model as assetModel, s.serial as assetSerial, s.category as assetCategory
      FROM Assignments a
      JOIN Users u ON u.id=a.userId
      JOIN Assets s ON s.id=a.assetId
      WHERE (@userId IS NULL OR a.userId=@userId)
        AND (@category IS NULL OR s.category=@category)
      ORDER BY a.assignedAt DESC;
    `);
    res.json(result.recordset);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'assignments_list_failed' });
  }
});

app.post('/assignments', async (req, res) => {
  const { userId, assetId, note, assignedAt } = req.body;
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('assetId', sql.UniqueIdentifier, assetId)
      .input('note', sql.NVarChar(500), note ?? null)
      .input('assignedAt', sql.DateTime2, assignedAt ? new Date(assignedAt) : new Date())
      .query(`
        DECLARE @id UNIQUEIDENTIFIER = NEWID();
        INSERT INTO Assignments (id, userId, assetId, assignedAt, note)
        VALUES (@id, @userId, @assetId, @assignedAt, @note);
        SELECT id, userId, assetId, assignedAt, note FROM Assignments WHERE id=@id;
      `);
    res.status(201).json(result.recordset[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'assignment_create_failed' });
  }
});

app.delete('/assignments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    await pool.request().input('id', sql.UniqueIdentifier, id).query('DELETE FROM Assignments WHERE id=@id');
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'assignment_delete_failed' });
  }
});

app.get('/assignments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .query(`
        SELECT a.id, a.userId, a.assetId, a.assignedAt, a.note,
               u.name as userName, u.email as userEmail,
               s.name as assetName, s.model as assetModel, s.serial as assetSerial, s.category as assetCategory
        FROM Assignments a
        JOIN Users u ON u.id=a.userId
        JOIN Assets s ON s.id=a.assetId
        WHERE a.id=@id
      `);
    if (!result.recordset[0]) return res.status(404).json({ error: 'not_found' });
    res.json(result.recordset[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'assignment_get_failed' });
  }
});

app.put('/assignments/:id', async (req, res) => {
  const { id } = req.params;
  const { userId, assetId, note, assignedAt } = req.body || {};
  try {
    const pool = await getPool();
    const reqst = pool.request().input('id', sql.UniqueIdentifier, id);
    let sets = [];
    if (userId) {
      reqst.input('userId', sql.UniqueIdentifier, userId);
      sets.push('userId=@userId');
    }
    if (assetId) {
      reqst.input('assetId', sql.UniqueIdentifier, assetId);
      sets.push('assetId=@assetId');
    }
    if (typeof note !== 'undefined') {
      reqst.input('note', sql.NVarChar(500), note ?? null);
      sets.push('note=@note');
    }
    if (assignedAt) {
      reqst.input('assignedAt', sql.DateTime2, new Date(assignedAt));
      sets.push('assignedAt=@assignedAt');
    }
    if (sets.length === 0) return res.status(400).json({ error: 'no_fields' });
    await reqst.query(`UPDATE Assignments SET ${sets.join(', ')} WHERE id=@id`);
    const result = await pool.request().input('id', sql.UniqueIdentifier, id).query('SELECT id, userId, assetId, assignedAt, note FROM Assignments WHERE id=@id');
    res.json(result.recordset[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'assignment_update_failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Zimmet API running on http://localhost:${PORT}`);
});
