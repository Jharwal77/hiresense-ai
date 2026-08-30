import { pool } from "../../config/mysql.js";

export async function createJob({
  companyId,
  employerId,
  title,
  description,
  requiredSkills,
  experienceMin,
  experienceMax,
  roleLevel,
  location,
  employmentType,
  salaryMin,
  salaryMax
}) {
  const [result] = await pool.execute(
    `
      INSERT INTO jobs (
        company_id,
        employer_id,
        title,
        description,
        required_skills,
        experience_min,
        experience_max,
        role_level,
        location,
        employment_type,
        salary_min,
        salary_max,
        source,
        is_external
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      companyId,
      employerId,
      title,
      description,
      JSON.stringify(requiredSkills || []),
      experienceMin ?? 0,
      experienceMax ?? null,
      roleLevel,
      location || null,
      employmentType,
      salaryMin ?? null,
      salaryMax ?? null,
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
        id,
        company_id,
        employer_id,
        title,
        description,
        required_skills,
        experience_min,
        experience_max,
        role_level,
        location,
        employment_type,
        salary_min,
        salary_max,
        status,
        source,
        external_job_id,
        external_url,
        is_external,
        created_at,
        updated_at
      FROM jobs
      WHERE id = ?
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
  roleLevel,
  employmentType,
  source,
  minSalary,
  maxSalary,
  minExperience,
  maxExperience,
  status = "open"
} = {}) {
  let query = `
    SELECT
      id,
      company_id,
      employer_id,
      title,
      description,
      required_skills,
      experience_min,
      experience_max,
      role_level,
      location,
      employment_type,
      salary_min,
      salary_max,
      status,
      source,
      external_job_id,
      external_url,
      is_external,
      created_at,
      updated_at
    FROM jobs
    WHERE status = ?
  `;

  const params = [status];

  if (search) {
    query += `
      AND (
        title LIKE ?
        OR description LIKE ?
      )
    `;

    const searchValue = `%${search}%`;

    params.push(
      searchValue,
      searchValue
    );
  }

  if (location) {
    query += `
      AND location LIKE ?
    `;

    params.push(
      `%${location}%`
    );
  }

  if (roleLevel) {
    query += `
      AND role_level = ?
    `;

    params.push(roleLevel);
  }

  if (employmentType) {
    query += `
      AND employment_type = ?
    `;

    params.push(employmentType);
  }

  if (source) {
    query += `
      AND source = ?
    `;

    params.push(source);
  }

  if (
    minSalary !== undefined &&
    minSalary !== null &&
    minSalary !== ""
  ) {
    query += `
      AND (
        salary_max IS NULL
        OR salary_max >= ?
      )
    `;

    params.push(
      Number(minSalary)
    );
  }

  if (
    maxSalary !== undefined &&
    maxSalary !== null &&
    maxSalary !== ""
  ) {
    query += `
      AND (
        salary_min IS NULL
        OR salary_min <= ?
      )
    `;

    params.push(
      Number(maxSalary)
    );
  }

  if (
    minExperience !== undefined &&
    minExperience !== null &&
    minExperience !== ""
  ) {
    query += `
      AND (
        experience_max IS NULL
        OR experience_max >= ?
      )
    `;

    params.push(
      Number(minExperience)
    );
  }

  if (
    maxExperience !== undefined &&
    maxExperience !== null &&
    maxExperience !== ""
  ) {
    query += `
      AND experience_min <= ?
    `;

    params.push(
      Number(maxExperience)
    );
  }

  query += `
    ORDER BY created_at DESC
  `;

  const [rows] =
    await pool.execute(
      query,
      params
    );

  return rows.map(formatJob);
}

export async function findJobsByEmployerId(
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
        required_skills,
        experience_min,
        experience_max,
        role_level,
        location,
        employment_type,
        salary_min,
        salary_max,
        status,
        source,
        external_job_id,
        external_url,
        is_external,
        created_at,
        updated_at
      FROM jobs
      WHERE employer_id = ?
        AND is_external = FALSE
      ORDER BY created_at DESC
    `,
    [employerId]
  );

  return rows.map(formatJob);
}

export async function updateJobById(
  id,
  employerId,
  {
    title,
    description,
    requiredSkills,
    experienceMin,
    experienceMax,
    roleLevel,
    location,
    employmentType,
    salaryMin,
    salaryMax
  }
) {
  const [result] = await pool.execute(
    `
      UPDATE jobs
      SET
        title = ?,
        description = ?,
        required_skills = ?,
        experience_min = ?,
        experience_max = ?,
        role_level = ?,
        location = ?,
        employment_type = ?,
        salary_min = ?,
        salary_max = ?
      WHERE id = ?
        AND employer_id = ?
        AND is_external = FALSE
    `,
    [
      title,
      description,
      JSON.stringify(
        requiredSkills || []
      ),
      experienceMin ?? 0,
      experienceMax ?? null,
      roleLevel,
      location || null,
      employmentType,
      salaryMin ?? null,
      salaryMax ?? null,
      id,
      employerId
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return findJobById(id);
}

export async function deleteJobById(
  id,
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
      id,
      employerId
    ]
  );

  return result.affectedRows > 0;
}

export async function closeJobById(
  id,
  employerId
) {
  const [result] = await pool.execute(
    `
      UPDATE jobs
      SET status = 'closed'
      WHERE id = ?
        AND employer_id = ?
        AND is_external = FALSE
        AND status = 'open'
    `,
    [
      id,
      employerId
    ]
  );

  return result.affectedRows > 0;
}

export async function findExternalJob(
  source,
  externalJobId
) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        company_id,
        employer_id,
        title,
        description,
        required_skills,
        experience_min,
        experience_max,
        role_level,
        location,
        employment_type,
        salary_min,
        salary_max,
        status,
        source,
        external_job_id,
        external_url,
        is_external,
        created_at,
        updated_at
      FROM jobs
      WHERE source = ?
        AND external_job_id = ?
        AND is_external = TRUE
      LIMIT 1
    `,
    [
      source,
      String(externalJobId)
    ]
  );

  return rows[0] || null;
}

export async function createExternalJob(
  job
) {
  const [result] = await pool.execute(
    `
      INSERT INTO jobs (
        company_id,
        employer_id,
        title,
        description,
        required_skills,
        experience_min,
        experience_max,
        role_level,
        location,
        employment_type,
        salary_min,
        salary_max,
        status,
        source,
        external_job_id,
        external_url,
        is_external
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      job.companyId ?? null,
      job.employerId ?? null,
      job.title,
      job.description || "",
      JSON.stringify(
        job.requiredSkills || []
      ),
      job.experienceMin ?? 0,
      job.experienceMax ?? null,
      job.roleLevel ||
        "not specified",
      job.location || null,
      job.employmentType ||
        "not specified",
      job.salaryMin ?? null,
      job.salaryMax ?? null,
      "open",
      job.source,
      String(
        job.externalJobId
      ),
      job.externalUrl || null,
      true
    ]
  );

  return findJobById(
    result.insertId
  );
}

export async function updateExternalJob(
  source,
  externalJobId,
  job
) {
  const [result] = await pool.execute(
    `
      UPDATE jobs
      SET
        title = ?,
        description = ?,
        required_skills = ?,
        experience_min = ?,
        experience_max = ?,
        role_level = ?,
        location = ?,
        employment_type = ?,
        salary_min = ?,
        salary_max = ?,
        external_url = ?,
        status = 'open',
        updated_at = CURRENT_TIMESTAMP
      WHERE source = ?
        AND external_job_id = ?
        AND is_external = TRUE
    `,
    [
      job.title,
      job.description || "",
      JSON.stringify(
        job.requiredSkills || []
      ),
      job.experienceMin ?? 0,
      job.experienceMax ?? null,
      job.roleLevel ||
        "not specified",
      job.location || null,
      job.employmentType ||
        "not specified",
      job.salaryMin ?? null,
      job.salaryMax ?? null,
      job.externalUrl || null,
      source,
      String(
        externalJobId
      )
    ]
  );

  return result.affectedRows > 0;
}

export async function upsertExternalJob(
  job
) {
  if (
    !job.source ||
    !job.externalJobId
  ) {
    throw new Error(
      "External job source and external job ID are required"
    );
  }

  const externalJobId =
    String(
      job.externalJobId
    );

  const existingJob =
    await findExternalJob(
      job.source,
      externalJobId
    );

  if (existingJob) {
    await updateExternalJob(
      job.source,
      externalJobId,
      job
    );

    return {
      action: "updated",
      jobId: existingJob.id
    };
  }

  const createdJob =
    await createExternalJob({
      ...job,
      externalJobId
    });

  return {
    action: "created",
    jobId: createdJob.id
  };
}

function formatJob(row) {
  let requiredSkills = [];

  if (
    Array.isArray(
      row.required_skills
    )
  ) {
    requiredSkills =
      row.required_skills;
  } else if (
    typeof row.required_skills ===
    "string"
  ) {
    try {
      requiredSkills =
        JSON.parse(
          row.required_skills
        );
    } catch {
      requiredSkills = [];
    }
  }

  return {
    id: row.id,

    companyId:
      row.company_id,

    employerId:
      row.employer_id,

    title:
      row.title,

    description:
      row.description,

    requiredSkills,

    experienceMin:
      Number(
        row.experience_min || 0
      ),

    experienceMax:
      row.experience_max === null
        ? null
        : Number(
            row.experience_max
          ),

    roleLevel:
      row.role_level,

    location:
      row.location,

    employmentType:
      row.employment_type,

    salaryMin:
      row.salary_min === null
        ? null
        : Number(
            row.salary_min
          ),

    salaryMax:
      row.salary_max === null
        ? null
        : Number(
            row.salary_max
          ),

    status:
      row.status,

    source:
      row.source ||
      "hiresense",

    externalJobId:
      row.external_job_id ||
      null,

    externalUrl:
      row.external_url ||
      null,

    isExternal:
      Boolean(
        row.is_external
      ),

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at
  };
}