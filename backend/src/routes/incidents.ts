import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  try {
    const { incident_id, facility_id, reported_by, reported_by_customer_id, status } =
      req.query as Record<string, string>;

    let query = 'SELECT * FROM incident WHERE 1=1';
    const values: string[] = [];

    if (incident_id) { values.push(incident_id); query += ` AND incident_id = $${values.length}`; }
    if (facility_id) { values.push(facility_id); query += ` AND facility_id = $${values.length}`; }
    if (reported_by) { values.push(reported_by); query += ` AND reported_by = $${values.length}`; }
    if (reported_by_customer_id) { values.push(reported_by_customer_id); query += ` AND reported_by_customer_id = $${values.length}`; }
    if (status) { values.push(status); query += ` AND status = $${values.length}`; }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Reporter is an employee (reported_by) or a customer complaint (reported_by_customer_id) —
// exactly one is required. This route doubles as the complaint system: if assigned_to isn't
// given, it defaults to the target facility's manager (the "complaint assignment engine").
router.post('/insert', async (req: Request, res: Response) => {
  try {
    const { facility_id, reported_by, reported_by_customer_id, assigned_to, description, status, reported_at, resolved_at } =
      req.query as Record<string, string>;

    if (!facility_id || !description) {
      res.status(400).json({ error: 'facility_id and description are required' });
      return;
    }
    if ((!reported_by && !reported_by_customer_id) || (reported_by && reported_by_customer_id)) {
      res.status(400).json({ error: 'Exactly one of reported_by or reported_by_customer_id is required' });
      return;
    }

    let assignee = assigned_to || null;
    if (!assignee) {
      const facilityResult = await pool.query('SELECT manager_id FROM facility WHERE facility_id = $1', [facility_id]);
      assignee = facilityResult.rows[0]?.manager_id ?? null;
    }

    await pool.query(
      `INSERT INTO incident (facility_id, reported_by, reported_by_customer_id, assigned_to, description, status, reported_at, resolved_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        facility_id,
        reported_by || null,
        reported_by_customer_id || null,
        assignee,
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
    const { incident_id, facility_id, reported_by, reported_by_customer_id, assigned_to, description, status, reported_at, resolved_at } =
      req.query as Record<string, string>;

    if (!incident_id) {
      res.status(400).json({ error: 'incident_id is required' });
      return;
    }
    if (reported_by && reported_by_customer_id) {
      res.status(400).json({ error: 'Exactly one of reported_by or reported_by_customer_id is required' });
      return;
    }

    const setClauses: string[] = [];
    const values: (string | null)[] = [];

    if (facility_id !== undefined) { values.push(facility_id); setClauses.push(`facility_id = $${values.length}`); }
    // Setting one side of the exclusive arc clears the other, so chk_incident_reporter can't be violated.
    if (reported_by !== undefined) { values.push(reported_by); setClauses.push(`reported_by = $${values.length}`, 'reported_by_customer_id = NULL'); }
    if (reported_by_customer_id !== undefined) { values.push(reported_by_customer_id); setClauses.push(`reported_by_customer_id = $${values.length}`, 'reported_by = NULL'); }
    if (assigned_to !== undefined) { values.push(assigned_to); setClauses.push(`assigned_to = $${values.length}`); }
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
