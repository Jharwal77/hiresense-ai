import { pool } from "../../config/mysql.js";

export async function createUser({
  name,
  email,
  passwordHash,
  role
}) {
  const [result] = await pool.execute(
    `
      INSERT INTO users
        (
          name,
          email,
          password_hash,
          role,
          auth_provider
        )
      VALUES
        (?, ?, ?, ?, 'local')
    `,
    [name, email, passwordHash, role]
  );

  return {
    id: result.insertId,
    name,
    email,
    role
  };
}

export async function createSocialUser({
  name,
  email,
  role,
  authProvider,
  providerId
}) {
  const [result] = await pool.execute(
    `
      INSERT INTO users
        (
          name,
          email,
          password_hash,
          role,
          auth_provider,
          provider_id
        )
      VALUES
        (?, ?, ?, ?, ?, ?)
    `,
    [
      name,
      email,
      "",
      role,
      authProvider,
      providerId
    ]
  );

  return {
    id: result.insertId,
    name,
    email,
    role,
    auth_provider: authProvider,
    provider_id: providerId
  };
}

export async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        name,
        email,
        password_hash,
        role,
        auth_provider,
        provider_id,
        created_at
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
}

export async function findUserByProvider({
  authProvider,
  providerId
}) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        name,
        email,
        password_hash,
        role,
        auth_provider,
        provider_id,
        created_at
      FROM users
      WHERE auth_provider = ?
        AND provider_id = ?
      LIMIT 1
    `,
    [authProvider, providerId]
  );

  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        name,
        email,
        role,
        auth_provider,
        provider_id,
        created_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}