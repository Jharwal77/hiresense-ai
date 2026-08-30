import { pool } from "../../config/mysql.js";

export async function createRefreshToken({
  userId,
  tokenHash,
  expiresAt
}) {
  const [result] = await pool.execute(
    `
      INSERT INTO refresh_tokens
        (user_id, token_hash, expires_at)
      VALUES
        (?, ?, ?)
    `,
    [userId, tokenHash, expiresAt]
  );

  return {
    id: result.insertId,
    userId,
    tokenHash,
    expiresAt
  };
}

export async function findRefreshTokenByHash(tokenHash) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        user_id,
        token_hash,
        expires_at,
        created_at,
        revoked_at
      FROM refresh_tokens
      WHERE token_hash = ?
      LIMIT 1
    `,
    [tokenHash]
  );

  return rows[0] || null;
}

export async function revokeRefreshToken(id) {
  const [result] = await pool.execute(
    `
      UPDATE refresh_tokens
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND revoked_at IS NULL
    `,
    [id]
  );

  return result.affectedRows > 0;
}

export async function revokeRefreshTokenByHash(tokenHash) {
  const [result] = await pool.execute(
    `
      UPDATE refresh_tokens
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE token_hash = ?
        AND revoked_at IS NULL
    `,
    [tokenHash]
  );

  return result.affectedRows > 0;
}