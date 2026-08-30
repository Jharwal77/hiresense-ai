import { pool } from "../config/mysql.js";
import ResumeProfile from "../models/mongo/resumeProfileModel.js";
import MatchResult from "../models/mongo/matchResultModel.js";
import { rankCandidates } from "./rankingService.js";

export async function applyForJob({
  jobId,
  candidateId
}) {
  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [jobs] =
      await connection.query(
        `
        SELECT
          id,
          company_id,
          employer_id,
          title,
          status
        FROM jobs
        WHERE id = ?
        LIMIT 1
        `,
        [jobId]
      );

    if (jobs.length === 0) {
      const error =
        new Error("Job not found");

      error.statusCode = 404;
      error.errorCode =
        "JOB_NOT_FOUND";

      throw error;
    }

    const job = jobs[0];

    if (job.status !== "open") {
      const error =
        new Error(
          "Job is not open for applications"
        );

      error.statusCode = 400;
      error.errorCode =
        "JOB_NOT_OPEN";

      throw error;
    }

    const [users] =
      await connection.query(
        `
        SELECT
          id,
          role
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [candidateId]
      );

    if (users.length === 0) {
      const error =
        new Error(
          "Candidate not found"
        );

      error.statusCode = 404;
      error.errorCode =
        "CANDIDATE_NOT_FOUND";

      throw error;
    }

    if (users[0].role !== "candidate") {
      const error =
        new Error(
          "Only candidates can apply for jobs"
        );

      error.statusCode = 403;
      error.errorCode =
        "CANDIDATE_REQUIRED";

      throw error;
    }

    const [existingApplications] =
      await connection.query(
        `
        SELECT
          id,
          status
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

    if (
      existingApplications.length > 0
    ) {
      const error =
        new Error(
          "You have already applied to this job"
        );

      error.statusCode = 409;
      error.errorCode =
        "DUPLICATE_APPLICATION";

      throw error;
    }

    const [result] =
      await connection.query(
        `
        INSERT INTO applications (
          job_id,
          candidate_id,
          status
        )
        VALUES (?, ?, 'applied')
        `,
        [
          jobId,
          candidateId
        ]
      );

    await connection.commit();

    const [applications] =
      await connection.query(
        `
        SELECT
          id,
          job_id,
          candidate_id,
          status,
          created_at,
          updated_at
        FROM applications
        WHERE id = ?
        LIMIT 1
        `,
        [result.insertId]
      );

    return applications[0];
  } catch (error) {
    await connection.rollback();

    if (
      error.code === "ER_DUP_ENTRY"
    ) {
      const duplicateError =
        new Error(
          "You have already applied to this job"
        );

      duplicateError.statusCode = 409;
      duplicateError.errorCode =
        "DUPLICATE_APPLICATION";

      throw duplicateError;
    }

    throw error;
  } finally {
    connection.release();
  }
}

export async function getCandidateApplications(
  candidateId
) {
  const [applications] =
    await pool.query(
      `
      SELECT
        a.id,
        a.job_id,
        a.candidate_id,
        a.status,
        a.created_at,
        a.updated_at,

        j.title,
        j.description,
        j.required_skills,
        j.experience_min,
        j.experience_max,
        j.role_level,
        j.location,
        j.employment_type,
        j.salary_min,
        j.salary_max,

        c.id AS company_id,
        c.name AS company_name,
        c.location AS company_location

      FROM applications a

      INNER JOIN jobs j
        ON j.id = a.job_id

      INNER JOIN companies c
        ON c.id = j.company_id

      WHERE a.candidate_id = ?

      ORDER BY a.created_at DESC
      `,
      [candidateId]
    );

  return applications.map(
    (application) => ({
      id:
        application.id,

      jobId:
        application.job_id,

      candidateId:
        application.candidate_id,

      status:
        application.status,

      createdAt:
        application.created_at,

      updatedAt:
        application.updated_at,

      job: {
        id:
          application.job_id,

        title:
          application.title,

        description:
          application.description,

        requiredSkills:
          parseJsonArray(
            application.required_skills
          ),

        experienceMin:
          application.experience_min,

        experienceMax:
          application.experience_max,

        roleLevel:
          application.role_level,

        location:
          application.location,

        employmentType:
          application.employment_type,

        salaryMin:
          application.salary_min,

        salaryMax:
          application.salary_max
      },

      company: {
        id:
          application.company_id,

        name:
          application.company_name,

        location:
          application.company_location
      }
    })
  );
}

export async function getJobApplications({
  jobId,
  employerId
}) {
  const [jobs] =
    await pool.query(
      `
      SELECT
        id,
        company_id,
        employer_id,
        title,
        status,
        experience_min,
        experience_max
      FROM jobs
      WHERE id = ?
      LIMIT 1
      `,
      [jobId]
    );

  if (jobs.length === 0) {
    const error =
      new Error("Job not found");

    error.statusCode = 404;
    error.errorCode =
      "JOB_NOT_FOUND";

    throw error;
  }

  const job = jobs[0];

  if (
    Number(job.employer_id) !==
    Number(employerId)
  ) {
    const error =
      new Error(
        "You do not have permission to view applications for this job"
      );

    error.statusCode = 403;
    error.errorCode =
      "JOB_ACCESS_FORBIDDEN";

    throw error;
  }

  const [applications] =
    await pool.query(
      `
      SELECT
        a.id,
        a.job_id,
        a.candidate_id,
        a.status,
        a.created_at,
        a.updated_at,

        u.name AS candidate_name,
        u.email AS candidate_email

      FROM applications a

      INNER JOIN users u
        ON u.id = a.candidate_id

      WHERE a.job_id = ?

      ORDER BY a.created_at DESC
      `,
      [jobId]
    );

  const candidateIds =
    applications.map(
      (application) =>
        Number(
          application.candidate_id
        )
    );

  const resumeProfiles =
    candidateIds.length > 0
      ? await ResumeProfile.find({
          candidateId: {
            $in: candidateIds
          }
        }).lean()
      : [];

  const resumeMap =
    new Map(
      resumeProfiles.map(
        (resume) => [
          Number(
            resume.candidateId
          ),
          resume
        ]
      )
    );

  const matchResults =
    candidateIds.length > 0
      ? await MatchResult.find({
          jobId,
          candidateId: {
            $in: candidateIds
          }
        }).lean()
      : [];

  const matchMap =
    new Map(
      matchResults.map(
        (match) => [
          Number(
            match.candidateId
          ),
          match
        ]
      )
    );

  const candidates =
    applications.map(
      (application) => {
        const candidateId =
          Number(
            application.candidate_id
          );

        const resume =
          resumeMap.get(
            candidateId
          );

        const match =
          matchMap.get(
            candidateId
          );

        return {
          id:
            application.id,

          jobId:
            application.job_id,

          candidateId,

          status:
            application.status,

          createdAt:
            application.created_at,

          updatedAt:
            application.updated_at,

          candidate: {
            id:
              candidateId,

            name:
              application.candidate_name,

            email:
              application.candidate_email,

            resume: resume
              ? {
                  id: resume._id,

                  name:
                    resume.name,

                  skills:
                    resume.skills,

                  experienceYears:
                    resume.experienceYears,

                  education:
                    resume.education,

                  workHistory:
                    resume.workHistory,

                  aiStatus:
                    resume.aiStatus,

                  aiError:
                    resume.aiError,

                  sourceDocument:
                    resume.sourceDocument
                }
              : null
          },

          job: {
            id:
              job.id,

            title:
              job.title,

            experienceMin:
              Number(
                job.experience_min ?? 0
              ),

            experienceMax:
              Number(
                job.experience_max ?? 0
              )
          },

          match: match
            ? {
                id:
                  match._id,

                matchScore:
                  Number(
                    match.matchScore ?? 0
                  ),

                reasoning:
                  match.reasoning,

                strengths:
                  match.strengths,

                gaps:
                  match.gaps
              }
            : null
        };
      }
    );

  const ranked =
    rankCandidates(
      candidates
    );

  return {
    job: {
      id:
        job.id,

      title:
        job.title,

      status:
        job.status
    },

    applications:
      ranked.map(
        (application, index) => ({
          id:
            application.id,

          jobId:
            application.jobId,

          candidateId:
            application.candidateId,

          status:
            application.status,

          createdAt:
            application.createdAt,

          updatedAt:
            application.updatedAt,

          rank:
            index + 1,

          candidate:
            application.candidate,

          match:
            application.match,

          ranking:
            application.ranking
        })
      )
  };
}

export async function updateApplicationStatus({
  applicationId,
  employerId,
  status
}) {
  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [applications] =
      await connection.query(
        `
        SELECT
          a.id,
          a.job_id,
          a.candidate_id,
          a.status,
          j.employer_id

        FROM applications a

        INNER JOIN jobs j
          ON j.id = a.job_id

        WHERE a.id = ?

        LIMIT 1
        `,
        [applicationId]
      );

    if (
      applications.length === 0
    ) {
      const error =
        new Error(
          "Application not found"
        );

      error.statusCode = 404;
      error.errorCode =
        "APPLICATION_NOT_FOUND";

      throw error;
    }

    const application =
      applications[0];

    if (
      Number(
        application.employer_id
      ) !==
      Number(employerId)
    ) {
      const error =
        new Error(
          "You do not have permission to update this application"
        );

      error.statusCode = 403;
      error.errorCode =
        "APPLICATION_ACCESS_FORBIDDEN";

      throw error;
    }

    await connection.query(
      `
      UPDATE applications

      SET
        status = ?,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = ?
      `,
      [
        status,
        applicationId
      ]
    );

    await connection.commit();

    const [
      updatedApplications
    ] = await connection.query(
      `
      SELECT
        id,
        job_id,
        candidate_id,
        status,
        created_at,
        updated_at

      FROM applications

      WHERE id = ?

      LIMIT 1
      `,
      [applicationId]
    );

    return updatedApplications[0];
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
}

function parseJsonArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}