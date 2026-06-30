import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  try {
    const { booking_id, facility_id, aadhaar_no, employee_id, payment_status } =
      req.query as Record<string, string>;

    let query = 'SELECT * FROM booking WHERE 1=1';
    const values: string[] = [];

    if (booking_id) { values.push(booking_id); query += ` AND booking_id = $${values.length}`; }
    if (facility_id) { values.push(facility_id); query += ` AND facility_id = $${values.length}`; }
    if (aadhaar_no) { values.push(aadhaar_no); query += ` AND aadhaar_no = $${values.length}`; }
    if (employee_id) { values.push(employee_id); query += ` AND employee_id = $${values.length}`; }
    if (payment_status) { values.push(payment_status); query += ` AND payment_status = $${values.length}`; }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT b.booking_id, b.date_time, b.payment_status,
             f.name AS facility_name, f.type,
             c.customer_name, c.contact_no,
             e.name AS employee_name
      FROM booking b
      JOIN facility f ON b.facility_id = f.facility_id
      JOIN customer c ON b.aadhaar_no = c.aadhaar_no
      JOIN employee e ON b.employee_id = e.employee_id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/create', async (req: Request, res: Response) => {
  try {
    const { facility_id, aadhaar_no, employee_id, date_time, payment_status } =
      req.query as Record<string, string>;

    if (!facility_id || !aadhaar_no || !employee_id) {
      res.status(400).json({ error: 'facility_id, aadhaar_no, and employee_id are required' });
      return;
    }

    await pool.query(
      `INSERT INTO booking (facility_id, aadhaar_no, employee_id, date_time, payment_status)
       VALUES ($1, $2, $3, $4, $5)`,
      [facility_id, aadhaar_no, employee_id, date_time || null, payment_status || 'Pending']
    );
    res.json({ status: 'success', message: 'Booking created successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/update', async (req: Request, res: Response) => {
  try {
    const { booking_id, facility_id, aadhaar_no, employee_id, date_time, payment_status } =
      req.query as Record<string, string>;

    if (!booking_id) {
      res.status(400).json({ error: 'booking_id is required' });
      return;
    }

    const setClauses: string[] = [];
    const values: string[] = [];

    if (facility_id !== undefined) { values.push(facility_id); setClauses.push(`facility_id = $${values.length}`); }
    if (aadhaar_no !== undefined) { values.push(aadhaar_no); setClauses.push(`aadhaar_no = $${values.length}`); }
    if (employee_id !== undefined) { values.push(employee_id); setClauses.push(`employee_id = $${values.length}`); }
    if (date_time !== undefined) { values.push(date_time); setClauses.push(`date_time = $${values.length}`); }
    if (payment_status !== undefined) { values.push(payment_status); setClauses.push(`payment_status = $${values.length}`); }

    if (setClauses.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(booking_id);
    await pool.query(
      `UPDATE booking SET ${setClauses.join(', ')} WHERE booking_id = $${values.length}`,
      values
    );
    res.json({ status: 'success', message: 'Booking updated successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/status', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const { Booking_Id, Facility_Id, Aadhaar_No, Payment_Status } = data;

    const result = await pool.query(
      `UPDATE booking SET payment_status = $1
       WHERE booking_id = $2 AND facility_id = $3 AND aadhaar_no = $4`,
      [Payment_Status, Booking_Id, Facility_Id, Aadhaar_No]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'No booking updated' });
      return;
    }
    res.json({ message: 'Booking status updated' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/delete', async (req: Request, res: Response) => {
  try {
    const { booking_id } = req.query as Record<string, string>;

    if (!booking_id) {
      res.status(400).json({ error: 'booking_id is required' });
      return;
    }

    const result = await pool.query('DELETE FROM booking WHERE booking_id = $1', [booking_id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    res.json({ status: 'success', message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
