import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  try {
    const { feedback_id, facility_id, aadhaar_no, manager_id, rating } =
      req.query as Record<string, string>;

    let query = 'SELECT * FROM feedback WHERE 1=1';
    const values: string[] = [];

    if (feedback_id) { values.push(feedback_id); query += ` AND feedback_id = $${values.length}`; }
    if (facility_id) { values.push(facility_id); query += ` AND facility_id = $${values.length}`; }
    if (aadhaar_no) { values.push(aadhaar_no); query += ` AND aadhaar_no = $${values.length}`; }
    if (manager_id) { values.push(manager_id); query += ` AND manager_id = $${values.length}`; }
    if (rating) { values.push(rating); query += ` AND rating = $${values.length}`; }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/insert', async (req: Request, res: Response) => {
  try {
    const { facility_id, aadhaar_no, manager_id, rating, comments, date_time } =
      req.query as Record<string, string>;

    if (!facility_id || !aadhaar_no || !manager_id || !rating) {
      res.status(400).json({ error: 'facility_id, aadhaar_no, manager_id, and rating are required' });
      return;
    }

    await pool.query(
      `INSERT INTO feedback (facility_id, aadhaar_no, manager_id, rating, comments, date_time)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [facility_id, aadhaar_no, manager_id, rating, comments || null, date_time || new Date().toISOString()]
    );
    res.json({ status: 'success', message: 'Feedback created successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/update', async (req: Request, res: Response) => {
  try {
    const { feedback_id, facility_id, aadhaar_no, manager_id, rating, comments, date_time } =
      req.query as Record<string, string>;

    if (!feedback_id) {
      res.status(400).json({ error: 'feedback_id is required' });
      return;
    }

    const setClauses: string[] = [];
    const values: (string | null)[] = [];

    if (facility_id !== undefined) { values.push(facility_id); setClauses.push(`facility_id = $${values.length}`); }
    if (aadhaar_no !== undefined) { values.push(aadhaar_no); setClauses.push(`aadhaar_no = $${values.length}`); }
    if (manager_id !== undefined) { values.push(manager_id); setClauses.push(`manager_id = $${values.length}`); }
    if (rating !== undefined) { values.push(rating); setClauses.push(`rating = $${values.length}`); }
    if (comments !== undefined) { values.push(comments || null); setClauses.push(`comments = $${values.length}`); }
    if (date_time !== undefined) { values.push(date_time); setClauses.push(`date_time = $${values.length}`); }

    if (setClauses.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(feedback_id);
    await pool.query(
      `UPDATE feedback SET ${setClauses.join(', ')} WHERE feedback_id = $${values.length}`,
      values
    );
    res.json({ status: 'success', message: 'Feedback updated successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/delete', async (req: Request, res: Response) => {
  try {
    const { feedback_id } = req.query as Record<string, string>;

    if (!feedback_id) {
      res.status(400).json({ error: 'feedback_id is required' });
      return;
    }

    const result = await pool.query('DELETE FROM feedback WHERE feedback_id = $1', [feedback_id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Feedback not found' });
      return;
    }
    res.json({ status: 'success', message: 'Feedback deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
