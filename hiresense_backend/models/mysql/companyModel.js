import { pool } from "../../config/mysql.js";

export async function createCompany({
  employerId,
  name,
  description,
  website,
  location
}) {
  const [result] = await pool.execute(
    `
      INSERT INTO companies
        (
          employer_id,
          name,
          description,
          website,
          location
        )
      VALUES
        (?, ?, ?, ?, ?)
    `,
    [
      employerId,
      name,
      description || null,
      website || null,
      location || null
    ]
  );

  return findCompanyById(result.insertId);
}

export async function findCompanyById(id) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        employer_id,
        name,
        description,
        website,
        location,
        created_at,
        updated_at
      FROM companies
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}

export async function findCompanyByEmployerId(
  employerId
) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        employer_id,
        name,
        description,
        website,
        location,
        created_at,
        updated_at
      FROM companies
      WHERE employer_id = ?
      LIMIT 1
    `,
    [employerId]
  );

  return rows[0] || null;
}

export async function updateCompanyByEmployerId(
  employerId,
  {
    name,
    description,
    website,
    location
  }
) {
  const [result] = await pool.execute(
    `
      UPDATE companies
      SET
        name = ?,
        description = ?,
        website = ?,
        location = ?
      WHERE employer_id = ?
    `,
    [
      name,
      description || null,
      website || null,
      location || null,
      employerId
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return findCompanyByEmployerId(employerId);
}