import { pool } from "./config/mysql.js";

await pool.query(`
  ALTER TABLE users
  ADD COLUMN auth_provider
    ENUM('local', 'google', 'github')
    NOT NULL DEFAULT 'local'
    AFTER password_hash,
  ADD COLUMN provider_id
    VARCHAR(255)
    NULL
    AFTER auth_provider,
  ADD UNIQUE KEY uq_provider_identity
    (auth_provider, provider_id)
`);

console.log("Users table updated");

await pool.end();