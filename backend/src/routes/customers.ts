import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  try {
    const { customer_id, customer_name, age, contact_no } =
      req.query as Record<string, string>;

    let query = 'SELECT * FROM customer WHERE 1=1';
    const values: string[] = [];

    if (customer_id) { values.push(customer_id); query += ` AND customer_id = $${values.length}`; }
    if (customer_name) { values.push(`%${customer_name}%`); query += ` AND customer_name ILIKE $${values.length}`; }
    if (age) { values.push(age); query += ` AND age = $${values.length}`; }
    if (contact_no) { values.push(contact_no); query += ` AND contact_no = $${values.length}`; }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/insert', async (req: Request, res: Response) => {
  try {
    const { customer_name, age, sex, nationality, contact_no } =
      req.query as Record<string, string>;

    if (!customer_name || !age || !contact_no) {
      res.status(400).json({ error: 'customer_name, age, and contact_no are required' });
      return;
    }

    await pool.query(
      `INSERT INTO customer (customer_name, age, sex, nationality, contact_no)
       VALUES ($1, $2, $3, $4, $5)`,
      [customer_name, age, sex || null, nationality || null, contact_no]
    );
    res.json({ status: 'success', message: 'Customer created successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/update', async (req: Request, res: Response) => {
  try {
    const { customer_id, customer_name, age, sex, nationality, contact_no } =
      req.query as Record<string, string>;

    if (!customer_id) {
      res.status(400).json({ error: 'customer_id is required' });
      return;
    }

    const setClauses: string[] = [];
    const values: string[] = [];

    if (customer_name !== undefined) { values.push(customer_name); setClauses.push(`customer_name = $${values.length}`); }
    if (age !== undefined) { values.push(age); setClauses.push(`age = $${values.length}`); }
    if (sex !== undefined) { values.push(sex); setClauses.push(`sex = $${values.length}`); }
    if (nationality !== undefined) { values.push(nationality); setClauses.push(`nationality = $${values.length}`); }
    if (contact_no !== undefined) { values.push(contact_no); setClauses.push(`contact_no = $${values.length}`); }

    if (setClauses.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(customer_id);
    await pool.query(
      `UPDATE customer SET ${setClauses.join(', ')} WHERE customer_id = $${values.length}`,
      values
    );
    res.json({ status: 'success', message: 'Customer updated successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
