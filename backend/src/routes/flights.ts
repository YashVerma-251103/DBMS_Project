import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  try {
    const { flight_number, airline, departure_date, origin, destination } = req.query as Record<string, string>;

    let query = 'SELECT * FROM flight WHERE 1=1';
    const values: string[] = [];

    if (flight_number) {
      values.push(flight_number);
      query += ` AND flight_number ILIKE $${values.length}`;
    }
    if (airline) {
      values.push(airline);
      query += ` AND airline ILIKE $${values.length}`;
    }
    if (departure_date) {
      values.push(departure_date);
      query += ` AND DATE(departure_time) = $${values.length}`;
    }
    if (origin) {
      values.push(`%${origin}%`);
      query += ` AND origin ILIKE $${values.length}`;
    }
    if (destination) {
      values.push(`%${destination}%`);
      query += ` AND destination ILIKE $${values.length}`;
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/create', async (req: Request, res: Response) => {
  try {
    const { flight_number, airline, origin, destination, departure_time, arrival_time, status, gate, terminal } =
      req.query as Record<string, string>;

    if (!flight_number || !airline) {
      res.status(400).json({ error: 'flight_number and airline are required' });
      return;
    }

    await pool.query(
      `INSERT INTO flight (flight_number, airline, origin, destination, departure_time, arrival_time, status, gate, terminal)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [flight_number, airline, origin || null, destination || null, departure_time || null, arrival_time || null, status || 'On Time', gate || null, terminal || null]
    );
    res.json({ status: 'success', message: 'Flight created successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/update', async (req: Request, res: Response) => {
  try {
    const { flight_number, airline, origin, destination, departure_time, arrival_time, status, gate, terminal } =
      req.query as Record<string, string>;

    if (!flight_number) {
      res.status(400).json({ error: 'flight_number is required' });
      return;
    }

    const setClauses: string[] = [];
    const values: (string | null)[] = [];

    if (airline !== undefined) { values.push(airline); setClauses.push(`airline = $${values.length}`); }
    if (origin !== undefined) { values.push(origin); setClauses.push(`origin = $${values.length}`); }
    if (destination !== undefined) { values.push(destination); setClauses.push(`destination = $${values.length}`); }
    if (departure_time !== undefined) { values.push(departure_time); setClauses.push(`departure_time = $${values.length}`); }
    if (arrival_time !== undefined) { values.push(arrival_time); setClauses.push(`arrival_time = $${values.length}`); }
    if (status !== undefined) { values.push(status); setClauses.push(`status = $${values.length}`); }
    if (gate !== undefined) { values.push(gate); setClauses.push(`gate = $${values.length}`); }
    if (terminal !== undefined) { values.push(terminal); setClauses.push(`terminal = $${values.length}`); }

    if (setClauses.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(flight_number);
    await pool.query(
      `UPDATE flight SET ${setClauses.join(', ')} WHERE flight_number = $${values.length}`,
      values
    );
    res.json({ status: 'success', message: 'Flight updated successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/:flight_number', async (req: Request, res: Response) => {
  try {
    const { flight_number } = req.params;
    const result = await pool.query('DELETE FROM flight WHERE flight_number = $1', [flight_number]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Flight not found' });
      return;
    }
    res.json({ status: 'success', message: 'Flight deleted' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
