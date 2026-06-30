import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

// Joined to facility so this one route serves both the admin/manager CRUD view and
// the public cross-store inventory search engine (extra joined columns are harmless
// to the CRUD UI, which just ignores them).
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { inventory_id, facility_id, item_name, supplier, type } = req.query as Record<string, string>;

    let query = `
      SELECT i.*, f.name AS facility_name, f.location AS facility_location, f.contact_no AS facility_contact
      FROM inventory i
      JOIN facility f ON i.facility_id = f.facility_id
      WHERE 1=1
    `;
    const values: string[] = [];

    if (inventory_id) { values.push(inventory_id); query += ` AND i.inventory_id = $${values.length}`; }
    if (facility_id) { values.push(facility_id); query += ` AND i.facility_id = $${values.length}`; }
    if (item_name) { values.push(`%${item_name}%`); query += ` AND i.item_name ILIKE $${values.length}`; }
    if (supplier) { values.push(`%${supplier}%`); query += ` AND i.supplier ILIKE $${values.length}`; }
    if (type) { values.push(type); query += ` AND f.type = $${values.length}`; }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/insert', async (req: Request, res: Response) => {
  try {
    const { facility_id, item_name, quantity, price, supplier } = req.query as Record<string, string>;

    if (!facility_id || !item_name) {
      res.status(400).json({ error: 'facility_id and item_name are required' });
      return;
    }

    await pool.query(
      `INSERT INTO inventory (facility_id, item_name, quantity, price, supplier)
       VALUES ($1, $2, $3, $4, $5)`,
      [facility_id, item_name, quantity || null, price || null, supplier || null]
    );
    res.json({ status: 'success', message: 'Inventory item created successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put('/update', async (req: Request, res: Response) => {
  try {
    const { inventory_id, facility_id, item_name, quantity, price, supplier } =
      req.query as Record<string, string>;

    if (!inventory_id) {
      res.status(400).json({ error: 'inventory_id is required' });
      return;
    }

    const setClauses: string[] = [];
    const values: string[] = [];

    if (facility_id !== undefined) { values.push(facility_id); setClauses.push(`facility_id = $${values.length}`); }
    if (item_name !== undefined) { values.push(item_name); setClauses.push(`item_name = $${values.length}`); }
    if (quantity !== undefined) { values.push(quantity); setClauses.push(`quantity = $${values.length}`); }
    if (price !== undefined) { values.push(price); setClauses.push(`price = $${values.length}`); }
    if (supplier !== undefined) { values.push(supplier); setClauses.push(`supplier = $${values.length}`); }

    if (setClauses.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(inventory_id);
    await pool.query(
      `UPDATE inventory SET ${setClauses.join(', ')} WHERE inventory_id = $${values.length}`,
      values
    );
    res.json({ status: 'success', message: 'Inventory item updated successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete('/delete', async (req: Request, res: Response) => {
  try {
    const { inventory_id } = req.query as Record<string, string>;

    if (!inventory_id) {
      res.status(400).json({ error: 'inventory_id is required' });
      return;
    }

    const result = await pool.query('DELETE FROM inventory WHERE inventory_id = $1', [inventory_id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Inventory item not found' });
      return;
    }
    res.json({ status: 'success', message: 'Inventory item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
