import { pool } from "../../config/mysql.js";

export async function createOAuthCode({
  codeHash,
  userId,
  role,
  expiresAt
}) {
  const [result] = await pool.execute(
    `
      INSERT INTO oauth_codes
        (code_hash, user_id, role, expires_at)
      VALUES
        (?, ?, ?, ?)
    `,
    [
      codeHash,
      userId,
      role,
      expiresAt
    ]
  );

  return result.insertId;
}

export async function findOAuthCodeByHash(
  codeHash
) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        code_hash,
        user_id,
        role,
        expires_at,
        used_at,
        created_at
      FROM oauth_codes
      WHERE code_hash = ?
      LIMIT 1
    `,
    [codeHash]
  );

  return rows[0] || null;
}

export async function consumeOAuthCode(
  id
) {
  const [result] = await pool.execute(
    `
      UPDATE oauth_codes
      SET used_at = NOW()
      WHERE id = ?
        AND used_at IS NULL
        AND expires_at > NOW()
    `,
    [id]
  );

  return result.affectedRows === 1;
}

export async function deleteExpiredOAuthCodes() {
  const [result] = await pool.execute(
    `
      DELETE FROM oauth_codes
      WHERE expires_at <= NOW()
        OR used_at IS NOT NULL
    `
  );

  return result.affectedRows;
}