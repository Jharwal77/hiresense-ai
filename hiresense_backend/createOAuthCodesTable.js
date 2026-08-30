import { pool } from "./config/mysql.js";

async function createOAuthCodesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS oauth_codes (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      code_hash CHAR(64) NOT NULL,
      user_id INT UNSIGNED NOT NULL,
      role ENUM('candidate', 'employer') NOT NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_oauth_code_hash (code_hash),
      KEY idx_oauth_code_expires (expires_at),
      CONSTRAINT fk_oauth_code_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    )
  `);

  console.log("OAuth codes table created");
  await pool.end();
}

createOAuthCodesTable().catch((error) => {
  console.error("Failed to create OAuth codes table:", error);
  process.exit(1);
});