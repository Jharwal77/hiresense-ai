import mysql from "mysql2/promise";
import env from "./env.js";

const pool = mysql.createPool({
  host: env.mysql.host,
  port: env.mysql.port,
  user: env.mysql.user,
  password: env.mysql.password,
  database: env.mysql.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true
});

async function connectMySQL() {
  const connection = await pool.getConnection();

  try {
    await connection.ping();
    console.log("MySQL connected");
  } finally {
    connection.release();
  }
}

async function checkMySQL() {
  const [rows] = await pool.query("SELECT 1 AS ok");
  return rows[0]?.ok === 1;
}

async function closeMySQL() {
  await pool.end();
  console.log("MySQL pool closed");
}

export {
  pool,
  connectMySQL,
  checkMySQL,
  closeMySQL
};