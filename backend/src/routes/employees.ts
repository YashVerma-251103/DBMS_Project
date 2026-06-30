import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  try {
    const { employee_id, name, role, shift_timings } = req.query as Record<string, string>;

    let query = 'SELECT * FROM employee WHERE 1=1';
    const values: string[] = [];

    if (employee_id) { values.push(employee_id); query += ` AND employee_id = $${values.length}`; }
    if (name) { values.push(`%${name}%`); query += ` AND name ILIKE $${values.length}`; }
    if (role) { values.push(role); query += ` AND role = $${values.length}`; }
    if (shift_timings) { values.push(`%${shift_timings}%`); query += ` AND shift_timings ILIKE $${values.length}`; }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/multiple-bookings', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT e.employee_id, e.name, COUNT(b.booking_id) AS booking_count
      FROM employee e
      JOIN booking b ON e.employee_id = b.employee_id
      WHERE b.date_time >= CURRENT_DATE - INTERVAL '1 month'
      GROUP BY e.employee_id, e.name
      HAVING COUNT(b.booking_id) >= 2
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/insert', async (req: Request, res: Response) => {
  try {
    const { name, role, shift_timings } = req.query as Record<string, string>;

    if (!name || !role) {
      res.status(400).json({ error: 'name and role are required' });
      return;
    }

    await pool.query(
      'INSERT INTO employee (name, role, shift_timings) VALUES ($1, $2, $3)',
      [name, role, shift_timings || null]
    );
    res.json({ status: 'success', message: 'Employee inserted successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/update', async (req: Request, res: Response) => {
  try {
    const { employee_id, name, role, shift_timings } = req.query as Record<string, string>;

    if (!employee_id) {
      res.status(400).json({ error: 'employee_id is required' });
      return;
    }

    const setClauses: string[] = [];
    const values: string[] = [];

    if (name !== undefined) { values.push(name); setClauses.push(`name = $${values.length}`); }
    if (role !== undefined) { values.push(role); setClauses.push(`role = $${values.length}`); }
    if (shift_timings !== undefined) { values.push(shift_timings); setClauses.push(`shift_timings = $${values.length}`); }

    if (setClauses.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(employee_id);
    await pool.query(
      `UPDATE employee SET ${setClauses.join(', ')} WHERE employee_id = $${values.length}`,
      values
    );
    res.json({ message: 'Employee updated successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/delete', async (req: Request, res: Response) => {
  try {
    const { employee_id } = req.query as Record<string, string>;

    if (!employee_id) {
      res.status(400).json({ error: 'employee_id is required' });
      return;
    }

    const result = await pool.query('DELETE FROM employee WHERE employee_id = $1', [employee_id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
