import { Router, Request, Response } from 'express';
import type { PoolClient } from 'pg';
import bcrypt from 'bcryptjs';
import pool from '../db';

const SALT_ROUNDS = 10;

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { loginId } = req.query as Record<string, string>;

    if (!loginId) {
      res.status(400).json({ error: 'loginId query parameter is required' });
      return;
    }

    const result = await pool.query(
      'SELECT id, name, contact_number, customer_id, employee_id, role, login_id FROM users WHERE login_id = $1',
      [loginId]
    );

    if (result.rows.length === 0) {
      res.json([]);
      return;
    }

    const user = result.rows[0];
    res.json([{
      id: user.id,
      name: user.name,
      contactNumber: user.contact_number,
      customerId: user.customer_id,
      employeeId: user.employee_id,
      role: user.role,
      loginId: user.login_id,
    }]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Login. Password comparison happens here, server-side, so the plaintext password is
// never sent to the client — GET / deliberately no longer returns it.
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      res.status(400).json({ error: 'loginId and password are required' });
      return;
    }

    const result = await pool.query(
      'SELECT id, name, contact_number, customer_id, employee_id, role, password, login_id FROM users WHERE login_id = $1',
      [loginId]
    );

    if (result.rows.length === 0 || !(await bcrypt.compare(password, result.rows[0].password))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      name: user.name,
      contactNumber: user.contact_number,
      customerId: user.customer_id,
      employeeId: user.employee_id,
      role: user.role,
      loginId: user.login_id,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Signup. Always creates a customer account — role is never taken from the request body,
// closing the self-service-admin-signup hole. Inserts Customer + users together so a new
// signup always has a matching domain row (previously only users was written, so Booking/
// Feedback inserts FK'd to a Customer row that never existed).
router.post('/', async (req: Request, res: Response) => {
  const { name, contactNumber, age, sex, nationality, password, loginId } = req.body;

  if (!loginId || !password || !name) {
    res.status(400).json({ error: 'name, loginId, and password are required' });
    return;
  }

  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const customerResult = await client.query(
      `INSERT INTO customer (customer_name, age, sex, nationality, contact_no)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING customer_id`,
      [name, age || null, sex || null, nationality || null, contactNumber || null]
    );
    const customerId = customerResult.rows[0].customer_id;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const userResult = await client.query(
      `INSERT INTO users (name, contact_number, customer_id, role, password, login_id)
       VALUES ($1, $2, $3, 'customer', $4, $5)
       RETURNING id, name, contact_number, customer_id, employee_id, role, password, login_id`,
      [name, contactNumber || null, customerId, hashedPassword, loginId]
    );

    await client.query('COMMIT');

    const user = userResult.rows[0];
    res.status(201).json({
      id: user.id,
      name: user.name,
      contactNumber: user.contact_number,
      customerId: user.customer_id,
      employeeId: user.employee_id,
      role: user.role,
      loginId: user.login_id,
    });
  } catch (err: any) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch { /* connection likely already dead */ }
    }
    if (err.code === '23505') {
      res.status(409).json({ error: `Login ID is already taken.` });
      return;
    }
    res.status(500).json({ error: String(err) });
  } finally {
    client?.release();
  }
});

// Profile edit. Query string carries the key (matches GET's convention); body carries
// the editable fields. currentPassword proves the caller owns this account — required
// since login_id alone is guessable ({contactNumber}_{role}) and isn't a secret.
router.put('/', async (req: Request, res: Response) => {
  try {
    const { loginId } = req.query as Record<string, string>;
    const { name, contactNumber, password, currentPassword } = req.body;

    if (!loginId) {
      res.status(400).json({ error: 'loginId query parameter is required' });
      return;
    }
    if (!currentPassword) {
      res.status(400).json({ error: 'currentPassword is required to update a profile' });
      return;
    }

    const owner = await pool.query('SELECT password FROM users WHERE login_id = $1', [loginId]);
    if (owner.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (!(await bcrypt.compare(currentPassword, owner.rows[0].password))) {
      res.status(403).json({ error: 'Current password is incorrect' });
      return;
    }

    const setClauses: string[] = [];
    const values: string[] = [];

    if (name !== undefined) { values.push(name); setClauses.push(`name = $${values.length}`); }
    if (contactNumber !== undefined) { values.push(contactNumber); setClauses.push(`contact_number = $${values.length}`); }
    if (password !== undefined) { values.push(await bcrypt.hash(password, SALT_ROUNDS)); setClauses.push(`password = $${values.length}`); }

    if (setClauses.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(loginId);
    await pool.query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE login_id = $${values.length}`,
      values
    );

    res.json({ status: 'success', message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Admin staff provisioning: creates the Employee row and the matching login together.
// Only 'Manager' gets manager-tier dashboard access today — every other role lands on
// the employee dashboard. Revisit if a non-manager role ever needs elevated access.
// Requires the calling admin's own credentials — this route grants real dashboard access,
// so it can't be left open the way the read-only search routes are.
router.post('/provision-staff', async (req: Request, res: Response) => {
  const { name, contactNumber, role, department, shiftTimings, password, adminLoginId, adminPassword } = req.body;

  if (!name || !contactNumber || !role || !shiftTimings || !password) {
    res.status(400).json({ error: 'name, contactNumber, role, shiftTimings, and password are required' });
    return;
  }
  if (!adminLoginId || !adminPassword) {
    res.status(400).json({ error: 'adminLoginId and adminPassword are required' });
    return;
  }

  const admin = await pool.query('SELECT password, role FROM users WHERE login_id = $1', [adminLoginId]);
  if (admin.rows.length === 0 || admin.rows[0].role !== 'admin' || !(await bcrypt.compare(adminPassword, admin.rows[0].password))) {
    res.status(403).json({ error: 'Admin credentials are invalid' });
    return;
  }

  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const employeeResult = await client.query(
      `INSERT INTO employee (name, role, department, shift_timings)
       VALUES ($1, $2, $3, $4)
       RETURNING employee_id`,
      [name, role, department || null, shiftTimings]
    );
    const employeeId = employeeResult.rows[0].employee_id;

    const dashboardRole = role === 'Manager' ? 'manager' : 'employee';
    const loginId = `${contactNumber}_${dashboardRole}`;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await client.query(
      `INSERT INTO users (name, contact_number, employee_id, role, password, login_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, contactNumber, employeeId, dashboardRole, hashedPassword, loginId]
    );

    await client.query('COMMIT');
    res.status(201).json({ loginId, employeeId });
  } catch (err: any) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch { /* connection likely already dead */ }
    }
    if (err.code === '23505') {
      res.status(409).json({ error: 'Login ID is already taken.' });
      return;
    }
    res.status(500).json({ error: String(err) });
  } finally {
    client?.release();
  }
});

export default router;
