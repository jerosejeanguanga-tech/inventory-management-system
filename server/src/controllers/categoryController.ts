import { Request, Response } from 'express';
import pool from '../config/db';

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute(
      'SELECT c.*, COUNT(p.id) as product_count FROM categories c LEFT JOIN products p ON c.id = p.category_id GROUP BY c.id ORDER BY c.created_at DESC'
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ message: 'Category name is required' });
    return;
  }
  try {
    const [result]: any = await pool.execute(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    res.status(201).json({ message: 'Category created', id: result.insertId });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    await pool.execute(
      'UPDATE categories SET name=?, description=? WHERE id=?',
      [name, description || null, id]
    );
    res.json({ message: 'Category updated' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM categories WHERE id=?', [id]);
    res.json({ message: 'Category deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};