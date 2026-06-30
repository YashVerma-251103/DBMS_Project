import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { loginId } = req.query as Record<string, string>;

    if (!loginId) {
      res.status(400).json({ error: 'loginId query parameter is required' });
      return;
    }

    const result = await pool.query(
      'SELECT id, name, contact_number, aaddhaar_no, role, password, login_id FROM users WHERE login_id = $1',
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
      aaddhaar_no: user.aaddhaar_no,
      role: user.role,
      password: user.password,
      loginId: user.login_id,
    }]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, contactNumber, aaddhaar_no, role, password, loginId } = req.body;

    if (!loginId || !password || !name) {
      res.status(400).json({ error: 'name, loginId, and password are required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO users (name, contact_number, aaddhaar_no, role, password, login_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, contact_number, aaddhaar_no, role, password, login_id`,
      [name, contactNumber || null, aaddhaar_no || null, role || null, password, loginId]
    );

    const user = result.rows[0];
    res.status(201).json({
      id: user.id,
      name: user.name,
      contactNumber: user.contact_number,
      aaddhaar_no: user.aaddhaar_no,
      role: user.role,
      password: user.password,
      loginId: user.login_id,
    });
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ error: `Login ID is already taken.` });
      return;
    }
    res.status(500).json({ error: String(err) });
  }
});

export default router;
