import mysql from 'mysql2/promise';
import type { Pool, PoolOptions } from 'mysql2/promise';

const config: PoolOptions = {
  host: 'localhost',
  user: 'root',
  password: 'my-secret-pw',
  database: 'mydb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool: Pool = mysql.createPool(config);


async function testConnection(): Promise<void> {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connection successful!");
    connection.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}

export default { pool, testConnection };
