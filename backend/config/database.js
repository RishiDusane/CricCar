const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const databaseName = process.env.DB_NAME;
const databaseOptions = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
};

if (!databaseName || !/^[a-zA-Z0-9_]+$/.test(databaseName)) {
  throw new Error('DB_NAME must contain only letters, numbers, and underscores.');
}

if (!databaseOptions.host || !databaseOptions.user || !process.env.DB_PASSWORD) {
  throw new Error('DB_HOST, DB_USER, and DB_PASSWORD must be set in backend/.env.');
}

let pool;

async function initializeDatabase() {
  const connection = await mysql.createConnection(databaseOptions);

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await connection.end();
  }

  pool = mysql.createPool({
    ...databaseOptions,
    database: databaseName,
    waitForConnections: true,
    connectionLimit: 10,
    decimalNumbers: true
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS players (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      age INT NULL,
      photo_url TEXT NULL,
      birthplace VARCHAR(150) NULL,
      career_desc TEXT NULL,
      matches INT NOT NULL DEFAULT 0,
      centuries INT NOT NULL DEFAULT 0,
      wickets INT NOT NULL DEFAULT 0,
      fifties INT NOT NULL DEFAULT 0,
      average DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function getPool() {
  if (!pool) {
    throw new Error('The database has not been initialized.');
  }

  return pool;
}

module.exports = { initializeDatabase, getPool };
