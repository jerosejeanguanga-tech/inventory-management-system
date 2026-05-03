import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Michael#12345',
  database: process.env.DB_NAME || 'inventory_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

pool.getConnection()
  .then((conn) => {
    console.log('✅ Database connected!');
    conn.release();
  })
  .catch((err) => console.error('❌ DB Error:', err.message));

export default pool;