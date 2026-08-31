import { pool } from "../../config/mysql.js";

export async function createApplication({
  jobId,
  candidateId
}) {
  const [result] = await pool.execute(
    `
      INSERT INTO applications
      (
        job_id,
        candidate_id
      )
      VALUES (?, ?)
    `,
    [
      jobId,
      candidateId
    ]
  );

  return findApplicationById(
    result.insertId
  );
}

export async function findApplicationById(
  applicationId
) {
  const [rows] = await pool.execute(
    `
      SELECT
        a.id,
        a.job_id,
        a.candidate_id,
        a.status,
        a.applied_at,
        a.updated_at,

        j.title AS job_title,
        j.description AS job_description,
        j.location AS job_location,
        j.employment_type,
        j.experience_level,
        j.source AS job_source,
        j.is_external,

        c.id AS company_id,
        c.name AS company_name,

        u.name AS candidate_name,
        u.email AS candidate_email

      FROM applications a

      INNER JOIN jobs j
        ON a.job_id = j.id

      LEFT JOIN companies c
        ON j.company_id = c.id

      INNER JOIN users u
        ON a.candidate_id = u.id

      WHERE a.id = ?

      LIMIT 1
    `,
    [applicationId]
  );

  if (!rows[0]) {
    return null;
  }

  return formatApplication(
    rows[0]
  );
}

export async function findApplicationByJobAndCandidate(
  jobId,
  candidateId
) {
  const [rows] = await pool.execute(
    `
      SELECT
        id
      FROM applications
      WHERE job_id = ?
        AND candidate_id = ?
      LIMIT 1
    `,
    [
      jobId,
      candidateId
    ]
  );

  if (!rows[0]) {
    return null;
  }

  return findApplicationById(
    rows[0].id
  );
}

export async function findApplicationsByCandidateId(
  candidateId
) {
  const [rows] = await pool.execute(
    `
      SELECT
        a.id,
        a.job_id,
        a.candidate_id,
        a.status,
        a.applied_at,
        a.updated_at,

        j.title AS job_title,
        j.description AS job_description,
        j.location AS job_location,
        j.employment_type,
        j.experience_level,
        j.source AS job_source,
        j.is_external,

        c.id AS company_id,
        c.name AS company_name

      FROM applications a

      INNER JOIN jobs j
        ON a.job_id = j.id

      LEFT JOIN companies c
        ON j.company_id = c.id

      WHERE a.candidate_id = ?

      ORDER BY a.applied_at DESC
    `,
    [candidateId]
  );

  return rows.map(
    formatApplication
  );
}

export async function findApplicationsByJobId(
  jobId
) {
  const [rows] = await pool.execute(
    `
      SELECT
        a.id,
        a.job_id,
        a.candidate_id,
        a.status,
        a.applied_at,
        a.updated_at,

        j.title AS job_title,

        u.name AS candidate_name,
        u.email AS candidate_email

      FROM applications a

      INNER JOIN jobs j
        ON a.job_id = j.id

      INNER JOIN users u
        ON a.candidate_id = u.id

      WHERE a.job_id = ?

      ORDER BY a.applied_at DESC
    `,
    [jobId]
  );

  return rows.map(
    formatApplication
  );
}

export async function updateApplicationStatusById(
  applicationId,
  status
) {
  const [result] = await pool.execute(
    `
      UPDATE applications
      SET status = ?
      WHERE id = ?
    `,
    [
      status,
      applicationId
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return findApplicationById(
    applicationId
  );
}

function formatApplication(row) {
  return {
    id: row.id,

    jobId: row.job_id,

    candidateId:
      row.candidate_id,

    status: row.status,

    appliedAt:
      row.applied_at,

    updatedAt:
      row.updated_at,

    job: {
      id: row.job_id,

      title:
        row.job_title || null,

      description:
        row.job_description || null,

      location:
        row.job_location || null,

      employmentType:
        row.employment_type || null,

      experienceLevel:
        row.experience_level || null,

      source:
        row.job_source || null,

      isExternal:
        Boolean(row.is_external)
    },

    company: row.company_id
      ? {
          id: row.company_id,

          name:
            row.company_name || null
        }
      : null,

    candidate: row.candidate_name
      ? {
          id:
            row.candidate_id,

          name:
            row.candidate_name,

          email:
            row.candidate_email
        }
      : null
  };
}