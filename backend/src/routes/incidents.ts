import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  try {
    const { incident_id, facility_id, reported_by, status } = req.query as Record<string, string>;

    let query = 'SELECT * FROM incident WHERE 1=1';
    const values: string[] = [];

    if (incident_id) { values.push(incident_id); query += ` AND incident_id = $${values.length}`; }
    if (facility_id) { values.push(facility_id); query += ` AND facility_id = $${values.length}`; }
    if (reported_by) { values.push(reported_by); query += ` AND reported_by = $${values.length}`; }
    if (status) { values.push(status); query += ` AND status = $${values.length}`; }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/insert', async (req: Request, res: Response) => {
  try {
    const { facility_id, reported_by, description, status, reported_at, resolved_at } =
      req.query as Record<string, string>;

    if (!facility_id || !reported_by || !description) {
      res.status(400).json({ error: 'facility_id, reported_by, and description are required' });
      return;
    }

    await pool.query(
      `INSERT INTO incident (facility_id, reported_by, description, status, reported_at, resolved_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        facility_id,
        reported_by,
        description,
        status || 'Reported',
        reported_at || new Date().toISOString(),
        resolved_at || null,
      ]
    );
    res.json({ status: 'success', message: 'Incident created successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/update', async (req: Request, res: Response) => {
  try {
    const { incident_id, facility_id, reported_by, description, status, reported_at, resolved_at } =
      req.query as Record<string, string>;

    if (!incident_id) {
      res.status(400).json({ error: 'incident_id is required' });
      return;
    }

    const setClauses: string[] = [];
    const values: (string | null)[] = [];

    if (facility_id !== undefined) { values.push(facility_id); setClauses.push(`facility_id = $${values.length}`); }
    if (reported_by !== undefined) { values.push(reported_by); setClauses.push(`reported_by = $${values.length}`); }
    if (description !== undefined) { values.push(description); setClauses.push(`description = $${values.length}`); }
    if (status !== undefined) { values.push(status); setClauses.push(`status = $${values.length}`); }
    if (reported_at !== undefined) { values.push(reported_at); setClauses.push(`reported_at = $${values.length}`); }
    if (resolved_at !== undefined) { values.push(resolved_at || null); setClauses.push(`resolved_at = $${values.length}`); }

    if (setClauses.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(incident_id);
    await pool.query(
      `UPDATE incident SET ${setClauses.join(', ')} WHERE incident_id = $${values.length}`,
      values
    );
    res.json({ status: 'success', message: 'Incident updated successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/resolved', async (req: Request, res: Response) => {
  try {
    const { id } = req.query as Record<string, string>;

    if (!id) {
      res.status(400).json({ error: 'Missing incident id' });
      return;
    }

    const result = await pool.query(
      "DELETE FROM incident WHERE incident_id = $1 AND status = 'Resolved'",
      [id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'No resolved incident found to delete' });
      return;
    }
    res.json({ message: 'Incident deleted' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/delete', async (req: Request, res: Response) => {
  try {
    const { incident_id } = req.query as Record<string, string>;

    if (!incident_id) {
      res.status(400).json({ error: 'incident_id is required' });
      return;
    }

    const result = await pool.query('DELETE FROM incident WHERE incident_id = $1', [incident_id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }
    res.json({ status: 'success', message: 'Incident deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
