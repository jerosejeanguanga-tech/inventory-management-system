import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const createRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const { product_id, quantity_requested, reason } = req.body;
  const user_id = req.user.id;

  if (!product_id || !quantity_requested) {
    res.status(400).json({ message: 'Product and quantity are required' });
    return;
  }

  try {
    // Check product exists and has enough stock
    const [products]: any = await pool.execute(
      'SELECT * FROM products WHERE id=?', [product_id]
    );
    if (!products.length) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    if (products[0].status === 'out_of_stock') {
      res.status(400).json({ message: 'Product is out of stock' });
      return;
    }

    await pool.execute(
      'INSERT INTO requests (user_id, product_id, quantity_requested, reason) VALUES (?, ?, ?, ?)',
      [user_id, product_id, quantity_requested, reason || null]
    );
    res.status(201).json({ message: 'Request submitted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, search, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const user_id = req.user.id;

  let query = `
    SELECT r.*, p.name as product_name, p.unit, p.image_url,
           c.name as category_name
    FROM requests r
    JOIN products p ON r.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE r.user_id = ?
  `;
  const params: any[] = [user_id];

  if (status) { query += ' AND r.status = ?'; params.push(status); }
  if (search) { query += ' AND p.name LIKE ?'; params.push(`%${search}%`); }
  query += ` ORDER BY r.created_at DESC LIMIT ${Number(limit)} OFFSET ${offset}`;

  try {
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, search, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = `
    SELECT r.*, p.name as product_name, p.unit, p.image_url,
           u.name as user_name, u.email,
           c.name as category_name
    FROM requests r
    JOIN products p ON r.product_id = p.id
    JOIN users u ON r.user_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status) { query += ' AND r.status = ?'; params.push(status); }
  if (search) {
    query += ' AND (p.name LIKE ? OR u.name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  query += ` ORDER BY r.created_at DESC LIMIT ${Number(limit)} OFFSET ${offset}`;

  try {
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateRequestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, admin_notes } = req.body;

  try {
    const [requests]: any = await pool.execute(
      'SELECT * FROM requests WHERE id=?', [id]
    );
    if (!requests.length) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    await pool.execute(
      'UPDATE requests SET status=?, admin_notes=? WHERE id=?',
      [status, admin_notes || null, id]
    );

    // If approved, deduct stock
    if (status === 'fulfilled') {
      const request = requests[0];
      await pool.execute(
        `UPDATE products SET
          quantity = quantity - ?,
          status = CASE
            WHEN quantity - ? = 0 THEN 'out_of_stock'
            WHEN quantity - ? <= 10 THEN 'low_stock'
            ELSE 'available'
          END
        WHERE id = ?`,
        [request.quantity_requested, request.quantity_requested, request.quantity_requested, request.product_id]
      );
    }

    res.json({ message: 'Request status updated' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.execute('DELETE FROM requests WHERE id=?', [req.params.id]);
    res.json({ message: 'Request deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};