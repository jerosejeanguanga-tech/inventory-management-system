import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.execute(
      'SELECT id, name, email, phone, location, role, profile_image, created_at FROM users WHERE id=?',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, phone, location } = req.body;
  const profile_image = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    if (profile_image) {
      await pool.execute(
        'UPDATE users SET name=?, phone=?, location=?, profile_image=? WHERE id=?',
        [name, phone || null, location || null, profile_image, req.user.id]
      );
    } else {
      await pool.execute(
        'UPDATE users SET name=?, phone=?, location=? WHERE id=?',
        [name, phone || null, location || null, req.user.id]
      );
    }
    const [rows]: any = await pool.execute(
      'SELECT id, name, email, phone, location, role, profile_image, created_at FROM users WHERE id=?',
      [req.user.id]
    );
    res.json({ message: 'Profile updated', ...rows[0] });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, location, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalProducts]: any = await pool.execute('SELECT COUNT(*) as count FROM products');
    const [totalCategories]: any = await pool.execute('SELECT COUNT(*) as count FROM categories');
    const [totalUsers]: any = await pool.execute('SELECT COUNT(*) as count FROM users');
    const [totalRequests]: any = await pool.execute('SELECT COUNT(*) as count FROM requests');
    const [pendingRequests]: any = await pool.execute("SELECT COUNT(*) as count FROM requests WHERE status='pending'");
    const [lowStock]: any = await pool.execute("SELECT COUNT(*) as count FROM products WHERE status='low_stock'");
    const [outOfStock]: any = await pool.execute("SELECT COUNT(*) as count FROM products WHERE status='out_of_stock'");
    const [recentRequests] = await pool.execute(`
      SELECT r.*, p.name as product_name, u.name as user_name
      FROM requests r
      JOIN products p ON r.product_id = p.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC LIMIT 5
    `);
    const [lowStockProducts] = await pool.execute(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status IN ('low_stock', 'out_of_stock')
      ORDER BY p.quantity ASC LIMIT 5
    `);

    res.json({
      stats: {
        totalProducts: totalProducts[0].count,
        totalCategories: totalCategories[0].count,
        totalUsers: totalUsers[0].count,
        totalRequests: totalRequests[0].count,
        pendingRequests: pendingRequests[0].count,
        lowStock: lowStock[0].count,
        outOfStock: outOfStock[0].count,
      },
      recentRequests,
      lowStockProducts
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};