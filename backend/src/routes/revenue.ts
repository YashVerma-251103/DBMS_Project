import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

router.get('/yearly/:year', async (req: Request, res: Response) => {
  try {
    const { year } = req.params;
    const result = await pool.query(
      `SELECT f.name AS facility_name, SUM(r.monthly_revenue) AS total_monthly_revenue
       FROM revenue r
       JOIN facility f ON r.facility_id = f.facility_id
       WHERE r.financial_year = $1
       GROUP BY f.name`,
      [year]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/average/:year', async (req: Request, res: Response) => {
  try {
    const { year } = req.params;
    const result = await pool.query(
      `SELECT r.facility_id, f.name AS facility_name,
              AVG(r.monthly_revenue) AS avg_monthly_revenue, r.financial_year
       FROM revenue r
       JOIN facility f ON r.facility_id = f.facility_id
       WHERE r.financial_year = $1
       GROUP BY r.facility_id, f.name, r.financial_year`,
      [year]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/calculate_avg', async (req: Request, res: Response) => {
  try {
    const { facility_id, start_date, end_date, revenue_type, aggregation, min_revenue, max_revenue } =
      req.query as Record<string, string>;

    const isTotal = aggregation?.toLowerCase() === 'total';
    const aggFn = isTotal ? 'SUM' : 'AVG';
    const aggAlias = isTotal ? 'total_revenue' : 'avg_revenue';

    let query = `
      SELECT r.facility_id, f.name AS facility_name,
             ${aggFn}(r.monthly_revenue) AS ${aggAlias},
             r.financial_year
      FROM revenue r
      JOIN facility f ON r.facility_id = f.facility_id
      WHERE 1=1
    `;
    const values: string[] = [];

    if (facility_id) { values.push(facility_id); query += ` AND r.facility_id = $${values.length}`; }
    if (start_date) { values.push(start_date); query += ` AND r.month >= $${values.length}`; }
    if (end_date) { values.push(end_date); query += ` AND r.month <= $${values.length}`; }

    query += ' GROUP BY r.facility_id, f.name, r.financial_year';

    if (min_revenue) { values.push(min_revenue); query += ` HAVING ${aggFn}(r.monthly_revenue) >= $${values.length}`; }
    if (max_revenue) {
      if (min_revenue) {
        values.push(max_revenue); query += ` AND ${aggFn}(r.monthly_revenue) <= $${values.length}`;
      } else {
        values.push(max_revenue); query += ` HAVING ${aggFn}(r.monthly_revenue) <= $${values.length}`;
      }
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
