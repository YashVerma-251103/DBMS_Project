import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  try {
    const { schedule_id, employee_id, facility_id, shift_date, shift_start, shift_end, task_description } =
      req.query as Record<string, string>;

    let query = 'SELECT * FROM staff_schedule WHERE 1=1';
    const values: string[] = [];

    if (schedule_id) { values.push(schedule_id); query += ` AND schedule_id = $${values.length}`; }
    if (employee_id) { values.push(employee_id); query += ` AND employee_id = $${values.length}`; }
    if (facility_id) { values.push(facility_id); query += ` AND facility_id = $${values.length}`; }
    if (shift_date) { values.push(shift_date); query += ` AND shift_date = $${values.length}`; }
    if (shift_start) { values.push(shift_start); query += ` AND shift_start >= $${values.length}`; }
    if (shift_end) { values.push(shift_end); query += ` AND shift_end <= $${values.length}`; }
    if (task_description) { values.push(`%${task_description}%`); query += ` AND task_description ILIKE $${values.length}`; }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/schedules/today', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT ss.schedule_id, e.name AS employee_name, ss.shift_date,
             ss.shift_start, ss.shift_end, com.message, com.sent_at, com.message_type
      FROM staff_schedule ss
      JOIN employee e ON ss.employee_id = e.employee_id
      LEFT JOIN communication com ON com.receiver_id = e.employee_id
      WHERE ss.shift_date = CURRENT_DATE
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/insert', async (req: Request, res: Response) => {
  try {
    const { employee_id, facility_id, shift_date, shift_start, shift_end, task_description } =
      req.query as Record<string, string>;

    if (!employee_id || !facility_id || !shift_date || !shift_start || !shift_end) {
      res.status(400).json({ error: 'employee_id, facility_id, shift_date, shift_start, and shift_end are required' });
      return;
    }

    await pool.query(
      `INSERT INTO staff_schedule (employee_id, facility_id, shift_date, shift_start, shift_end, task_description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [employee_id, facility_id, shift_date, shift_start, shift_end, task_description || null]
    );
    res.json({ status: 'success', message: 'Schedule created successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/update', async (req: Request, res: Response) => {
  try {
    const { schedule_id, employee_id, facility_id, shift_date, shift_start, shift_end, task_description } =
      req.query as Record<string, string>;

    if (!schedule_id) {
      res.status(400).json({ error: 'schedule_id is required' });
      return;
    }

    const setClauses: string[] = [];
    const values: (string | null)[] = [];

    if (employee_id !== undefined) { values.push(employee_id); setClauses.push(`employee_id = $${values.length}`); }
    if (facility_id !== undefined) { values.push(facility_id); setClauses.push(`facility_id = $${values.length}`); }
    if (shift_date !== undefined) { values.push(shift_date); setClauses.push(`shift_date = $${values.length}`); }
    if (shift_start !== undefined) { values.push(shift_start); setClauses.push(`shift_start = $${values.length}`); }
    if (shift_end !== undefined) { values.push(shift_end); setClauses.push(`shift_end = $${values.length}`); }
    if (task_description !== undefined) { values.push(task_description || null); setClauses.push(`task_description = $${values.length}`); }

    if (setClauses.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(schedule_id);
    await pool.query(
      `UPDATE staff_schedule SET ${setClauses.join(', ')} WHERE schedule_id = $${values.length}`,
      values
    );
    res.json({ status: 'success', message: 'Schedule updated successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/delete', async (req: Request, res: Response) => {
  try {
    const { schedule_id } = req.query as Record<string, string>;

    if (!schedule_id) {
      res.status(400).json({ error: 'schedule_id is required' });
      return;
    }

    const result = await pool.query('DELETE FROM staff_schedule WHERE schedule_id = $1', [schedule_id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }
    res.json({ status: 'success', message: 'Schedule deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
