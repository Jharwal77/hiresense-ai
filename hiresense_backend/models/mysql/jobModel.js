import { pool } from "../../config/mysql.js";

export async function createJob({
  companyId,
  employerId,
  title,
  description,
  location,
  employmentType,
  experienceLevel,
  skills
}) {
  const [result] = await pool.execute(
    `
      INSERT INTO jobs
      (
        company_id,
        employer_id,
        title,
        description,
        location,
        employment_type,
        experience_level,
        skills,
        source,
        is_external
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      companyId,
      employerId,
      title,
      description,
      location || null,
      employmentType || null,
      experienceLevel || null,
      JSON.stringify(skills || []),
      "hiresense",
      false
    ]
  );

  return findJobById(result.insertId);
}

export async function findJobById(id) {
  const [rows] = await pool.execute(
    `
      SELECT
        j.id,
        j.company_id,
        j.employer_id,
        j.title,
        j.description,
        j.location,
        j.employment_type,
        j.experience_level,
        j.skills,
        j.status,
        j.source,
        j.external_job_id,
        j.external_url,
        j.is_external,
        j.created_at,
        j.updated_at,
        c.name AS company_name
      FROM jobs j
      LEFT JOIN companies c
        ON j.company_id = c.id
      WHERE j.id = ?
      LIMIT 1
    `,
    [id]
  );

  if (!rows[0]) {
    return null;
  }

  return formatJob(rows[0]);
}

export async function findJobs({
  search,
  location,
  employmentType,
  experienceLevel,
  source,
  status = "open"
} = {}) {
  let query = `
    SELECT
      j.id,
      j.company_id,
      j.employer_id,
      j.title,
      j.description,
      j.location,
      j.employment_type,
      j.experience_level,
      j.skills,
      j.status,
      j.source,
      j.external_job_id,
      j.external_url,
      j.is_external,
      j.created_at,
      j.updated_at,
      c.name AS company_name
    FROM jobs j
    LEFT JOIN companies c
      ON j.company_id = c.id
    WHERE j.status = ?
  `;

  const values = [status];

  if (search) {
    query += `
      AND (
        j.title LIKE ?
        OR j.description LIKE ?
      )
    `;

    values.push(
      `%${search}%`,
      `%${search}%`
    );
  }

  if (location) {
    query += `
      AND j.location LIKE ?
    `;

    values.push(
      `%${location}%`
    );
  }

  if (employmentType) {
    query += `
      AND j.employment_type = ?
    `;

    values.push(employmentType);
  }

  if (experienceLevel) {
    query += `
      AND j.experience_level = ?
    `;

    values.push(experienceLevel);
  }

  if (source) {
    query += `
      AND j.source = ?
    `;

    values.push(source);
  }

  query += `
    ORDER BY j.created_at DESC
  `;

  const [rows] = await pool.execute(
    query,
    values
  );

  return rows.map(formatJob);
}

export async function findJobsByEmployerId(
  employerId
) {
  const [rows] = await pool.execute(
    `
      SELECT
        j.id,
        j.company_id,
        j.employer_id,
        j.title,
        j.description,
        j.location,
        j.employment_type,
        j.experience_level,
        j.skills,
        j.status,
        j.source,
        j.external_job_id,
        j.external_url,
        j.is_external,
        j.created_at,
        j.updated_at,
        c.name AS company_name
      FROM jobs j
      LEFT JOIN companies c
        ON j.company_id = c.id
      WHERE j.employer_id = ?
        AND j.is_external = FALSE
      ORDER BY j.created_at DESC
    `,
    [employerId]
  );

  return rows.map(formatJob);
}

export async function findJobByIdAndEmployerId(
  jobId,
  employerId
) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        company_id,
        employer_id,
        title,
        description,
        location,
        employment_type,
        experience_level,
        skills,
        status,
        source,
        external_job_id,
        external_url,
        is_external,
        created_at,
        updated_at
      FROM jobs
      WHERE id = ?
        AND employer_id = ?
        AND is_external = FALSE
      LIMIT 1
    `,
    [
      jobId,
      employerId
    ]
  );

  if (!rows[0]) {
    return null;
  }

  return formatJob(rows[0]);
}

export async function updateJobById(
  jobId,
  employerId,
  {
    title,
    description,
    location,
    employmentType,
    experienceLevel,
    skills,
    status
  }
) {
  const [result] = await pool.execute(
    `
      UPDATE jobs
      SET
        title = ?,
        description = ?,
        location = ?,
        employment_type = ?,
        experience_level = ?,
        skills = ?,
        status = ?
      WHERE id = ?
        AND employer_id = ?
        AND is_external = FALSE
    `,
    [
      title,
      description,
      location || null,
      employmentType || null,
      experienceLevel || null,
      JSON.stringify(skills || []),
      status,
      jobId,
      employerId
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return findJobById(jobId);
}

export async function deleteJobById(
  jobId,
  employerId
) {
  const [result] = await pool.execute(
    `
      DELETE FROM jobs
      WHERE id = ?
        AND employer_id = ?
        AND is_external = FALSE
    `,
    [
      jobId,
      employerId
    ]
  );

  return result.affectedRows > 0;
}

export async function upsertExternalJob({
  source,
  externalJobId,
  title,
  description,
  location,
  employmentType,
  experienceLevel,
  skills,
  externalUrl
}) {
  const [existingRows] = await pool.execute(
    `
      SELECT id
      FROM jobs
      WHERE source = ?
        AND external_job_id = ?
      LIMIT 1
    `,
    [
      source,
      externalJobId
    ]
  );

  if (existingRows.length > 0) {
    const existingJobId =
      existingRows[0].id;

    await pool.execute(
      `
        UPDATE jobs
        SET
          title = ?,
          description = ?,
          location = ?,
          employment_type = ?,
          experience_level = ?,
          skills = ?,
          external_url = ?,
          status = 'open',
          is_external = TRUE
        WHERE id = ?
      `,
      [
        title,
        description,
        location || null,
        employmentType || null,
        experienceLevel || null,
        JSON.stringify(skills || []),
        externalUrl || null,
        existingJobId
      ]
    );

    return {
      jobId: existingJobId,
      action: "updated"
    };
  }

  const [result] = await pool.execute(
    `
      INSERT INTO jobs
      (
        employer_id,
        company_id,
        title,
        description,
        location,
        employment_type,
        experience_level,
        skills,
        status,
        source,
        external_job_id,
        external_url,
        is_external
      )
      VALUES
      (
        NULL,
        NULL,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        'open',
        ?,
        ?,
        ?,
        TRUE
      )
    `,
    [
      title,
      description,
      location || null,
      employmentType || null,
      experienceLevel || null,
      JSON.stringify(skills || []),
      source,
      externalJobId,
      externalUrl || null
    ]
  );

  return {
    jobId: result.insertId,
    action: "created"
  };
}

function formatJob(row) {
  let skills = [];

  if (Array.isArray(row.skills)) {
    skills = row.skills;
  } else if (typeof row.skills === "string") {
    try {
      skills = JSON.parse(row.skills);
    } catch {
      skills = [];
    }
  }

  return {
    id: row.id,
    companyId: row.company_id,
    companyName: row.company_name || null,
    employerId: row.employer_id,
    title: row.title,
    description: row.description,
    location: row.location,
    employmentType: row.employment_type,
    experienceLevel: row.experience_level,
    skills,
    status: row.status,
    source: row.source,
    externalJobId: row.external_job_id || null,
    externalUrl: row.external_url || null,
    isExternal: Boolean(row.is_external),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}