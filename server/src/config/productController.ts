import { Request, Response } from 'express';
import pool from './db';

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  const { search, category_id, status, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = `
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category_id) {
    query += ' AND p.category_id = ?';
    params.push(category_id);
  }
  if (status) {
    query += ' AND p.status = ?';
    params.push(status);
  }

  query += ` ORDER BY p.created_at DESC LIMIT ${Number(limit)} OFFSET ${offset}`;

  try {
    const [rows] = await pool.execute(query, params);

    // Count total
    let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE 1=1';
    const countParams: any[] = [];
    if (search) {
      countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    if (category_id) {
      countQuery += ' AND p.category_id = ?';
      countParams.push(category_id);
    }
    if (status) {
      countQuery += ' AND p.status = ?';
      countParams.push(status);
    }

    const [countResult]: any = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      products: rows,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.execute(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [req.params.id]
    );
    if (!rows.length) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const { name, description, category_id, quantity, unit, price } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || quantity === undefined || !price) {
    res.status(400).json({ message: 'Name, quantity and price are required' });
    return;
  }

  // Auto set status based on quantity
  let status = 'available';
  if (Number(quantity) === 0) status = 'out_of_stock';
  else if (Number(quantity) <= 10) status = 'low_stock';

  try {
    const [result]: any = await pool.execute(
      'INSERT INTO products (name, description, category_id, quantity, unit, price, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description || null, category_id || null, quantity, unit || 'pcs', price, image_url, status]
    );
    res.status(201).json({ message: 'Product created', id: result.insertId });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, category_id, quantity, unit, price } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;

  // Auto set status based on quantity
  let status = 'available';
  if (Number(quantity) === 0) status = 'out_of_stock';
  else if (Number(quantity) <= 10) status = 'low_stock';

  try {
    if (image_url) {
      await pool.execute(
        'UPDATE products SET name=?, description=?, category_id=?, quantity=?, unit=?, price=?, image_url=?, status=? WHERE id=?',
        [name, description || null, category_id || null, quantity, unit || 'pcs', price, image_url, status, id]
      );
    } else {
      await pool.execute(
        'UPDATE products SET name=?, description=?, category_id=?, quantity=?, unit=?, price=?, status=? WHERE id=?',
        [name, description || null, category_id || null, quantity, unit || 'pcs', price, status, id]
      );
    }
    res.json({ message: 'Product updated' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    await pool.execute('DELETE FROM products WHERE id=?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateStock = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { quantity, action } = req.body;

  try {
    const [rows]: any = await pool.execute('SELECT * FROM products WHERE id=?', [id]);
    if (!rows.length) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    let newQuantity = rows[0].quantity;
    if (action === 'add') newQuantity += Number(quantity);
    else if (action === 'subtract') newQuantity -= Number(quantity);
    else newQuantity = Number(quantity);

    if (newQuantity < 0) {
      res.status(400).json({ message: 'Insufficient stock' });
      return;
    }

    let status = 'available';
    if (newQuantity === 0) status = 'out_of_stock';
    else if (newQuantity <= 10) status = 'low_stock';

    await pool.execute(
      'UPDATE products SET quantity=?, status=? WHERE id=?',
      [newQuantity, status, id]
    );
    res.json({ message: 'Stock updated', quantity: newQuantity, status });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};