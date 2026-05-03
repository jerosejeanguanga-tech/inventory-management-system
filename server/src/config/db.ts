import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env['tramway.proxy.rlwy.net'],
  user: process.env['root'],
  password: process.env['IuNzyNYiVvSuIRPwHttIRXcKpsQvwvdo'],
  database: process.env['railway'],
  port: Number(process.env['53574']) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false  // ← required for Railway connection
  }
});

export default pool;