import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, phone, location } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: 'Name, email and password are required' });
    return;
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.execute(
      'INSERT INTO users (name, email, password, phone, location) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashed, phone || null, location || null]
    );
    res.status(201).json({ message: 'Registered successfully' });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }
  try {
    const [rows]: any = await pool.execute(
      'SELECT * FROM users WHERE email = ?', [email]
    );
    if (!rows.length) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        profile_image: user.profile_image
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};