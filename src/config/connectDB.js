const mysql = require('mysql2/promise');
require('dotenv').config();

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connection test
async function checkConnection() {
  try {
    const conn = await connection.getConnection();
    await conn.ping(); // Lightweight test
    console.log("✅ MySQL new database connected successfully!");
    conn.release(); // Release back to pool
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
  }
}

checkConnection();

module.exports = connection;
