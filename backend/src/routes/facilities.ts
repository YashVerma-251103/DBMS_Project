import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  try {
    const { facility_id, name, type, location, manager_id } = req.query as Record<string, string>;

    let query = 'SELECT * FROM facility WHERE 1=1';
    const values: string[] = [];

    if (facility_id) { values.push(facility_id); query += ` AND facility_id = $${values.length}`; }
    if (name) { values.push(`%${name}%`); query += ` AND name ILIKE $${values.length}`; }
    if (type) { values.push(type); query += ` AND type = $${values.length}`; }
    if (location) { values.push(`%${location}%`); query += ` AND location ILIKE $${values.length}`; }
    if (manager_id) { values.push(manager_id); query += ` AND manager_id = $${values.length}`; }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/top-rated', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT f.facility_id, f.name
      FROM facility f
      WHERE f.facility_id IN (
        SELECT fb.facility_id FROM feedback fb
        GROUP BY fb.facility_id
        HAVING AVG(fb.rating) > 4
      )
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/insert', async (req: Request, res: Response) => {
  try {
    const { name, type, location, contact_no, opening_hours, manager_id } =
      req.query as Record<string, string>;

    if (!name || !type || !location || !manager_id) {
      res.status(400).json({ error: 'name, type, location, and manager_id are required' });
      return;
    }

    await pool.query(
      `INSERT INTO facility (name, type, location, contact_no, opening_hours, manager_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, type, location, contact_no || null, opening_hours || null, manager_id]
    );
    res.json({ status: 'success', message: 'Facility created successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/update', async (req: Request, res: Response) => {
  try {
    const { facility_id, name, type, location, contact_no, opening_hours, manager_id } =
      req.query as Record<string, string>;

    if (!facility_id) {
      res.status(400).json({ error: 'facility_id is required' });
      return;
    }

    const setClauses: string[] = [];
    const values: string[] = [];

    if (name !== undefined) { values.push(name); setClauses.push(`name = $${values.length}`); }
    if (type !== undefined) { values.push(type); setClauses.push(`type = $${values.length}`); }
    if (location !== undefined) { values.push(location); setClauses.push(`location = $${values.length}`); }
    if (contact_no !== undefined) { values.push(contact_no); setClauses.push(`contact_no = $${values.length}`); }
    if (opening_hours !== undefined) { values.push(opening_hours); setClauses.push(`opening_hours = $${values.length}`); }
    if (manager_id !== undefined) { values.push(manager_id); setClauses.push(`manager_id = $${values.length}`); }

    if (setClauses.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(facility_id);
    await pool.query(
      `UPDATE facility SET ${setClauses.join(', ')} WHERE facility_id = $${values.length}`,
      values
    );
    res.json({ status: 'success', message: 'Facility updated successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/delete', async (req: Request, res: Response) => {
  try {
    const { facility_id } = req.query as Record<string, string>;

    if (!facility_id) {
      res.status(400).json({ error: 'facility_id is required' });
      return;
    }

    const result = await pool.query('DELETE FROM facility WHERE facility_id = $1', [facility_id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Facility not found' });
      return;
    }
    res.json({ status: 'success', message: 'Facility deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
