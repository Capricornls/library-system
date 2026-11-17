// Database connection + automatic table creation.
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};
const DB_NAME = process.env.DB_NAME || 'library_db';

let pool;

async function init() {
  // 1. Make sure the database exists
  const conn = await mysql.createConnection(baseConfig);
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await conn.end();

  // 2. Create the pool we use everywhere else
  pool = mysql.createPool({
    ...baseConfig,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  });

  // 3. Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      genre VARCHAR(100) NOT NULL,
      isbn VARCHAR(20) NOT NULL UNIQUE,
      quantity INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      membership_id VARCHAR(50) NOT NULL UNIQUE,
      role ENUM('admin','member') NOT NULL DEFAULT 'member',
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      book_id INT NOT NULL,
      user_id INT NULL,
      type ENUM('ADD_STOCK','BORROW') NOT NULL,
      quantity INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`);

  // 4. Seed a default admin so you can log in the first time
  const [rows] = await pool.query('SELECT COUNT(*) AS n FROM users');
  if (rows[0].n === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (name, membership_id, role, password_hash) VALUES (?,?,?,?)',
      ['Administrator', 'ADMIN001', 'admin', hash]
    );
    console.log('Seeded default admin -> membership ID: ADMIN001, password: admin123');
  }
}

module.exports = {
  init,
  query: (...args) => pool.query(...args),
  getConnection: () => pool.getConnection(),
};
