import {
  createJob as createJobModel,
  findJobById,
  findJobs,
  findJobsByEmployerId,
  updateJobById,
  deleteJobById
} from "../models/mysql/jobModel.js";

import {
  findCompanyByEmployerId
} from "../models/mysql/companyModel.js";

export async function createEmployerJob({
  employerId,
  title,
  description,
  location,
  employmentType,
  experienceLevel,
  roleLevel,
  skills,
  requiredSkills
}) {
  const company =
    await findCompanyByEmployerId(employerId);

  if (!company) {
    const error = new Error(
      "Create a company profile before posting a job"
    );

    error.statusCode = 400;
    error.errorCode =
      "COMPANY_PROFILE_REQUIRED";

    throw error;
  }

  return createJobModel({
    companyId: company.id,
    employerId,
    title,
    description,
    location,
    employmentType,
    experienceLevel:
      experienceLevel ?? roleLevel ?? null,
    skills:
      skills ?? requiredSkills ?? []
  });
}

export async function getJob(id) {
  const job =
    await findJobById(id);

  if (!job) {
    const error = new Error(
      "Job not found"
    );

    error.statusCode = 404;
    error.errorCode =
      "JOB_NOT_FOUND";

    throw error;
  }

  return job;
}

export async function getPublicJobs(
  filters = {}
) {
  return findJobs({
    search: filters.search,
    location: filters.location,
    employmentType:
      filters.employmentType,
    experienceLevel:
      filters.experienceLevel,
    status: "open"
  });
}

export async function getEmployerJobs(
  employerId
) {
  return findJobsByEmployerId(
    employerId
  );
}

export async function updateEmployerJob(
  jobId,
  employerId,
  updates = {}
) {
  const existingJob =
    await findJobById(jobId);

  if (!existingJob) {
    const error = new Error(
      "Job not found"
    );

    error.statusCode = 404;
    error.errorCode =
      "JOB_NOT_FOUND";

    throw error;
  }

  if (
    existingJob.employerId !== employerId
  ) {
    const error = new Error(
      "You do not have permission to modify this job"
    );

    error.statusCode = 403;
    error.errorCode =
      "JOB_ACCESS_FORBIDDEN";

    throw error;
  }

  return updateJobById(
    jobId,
    employerId,
    {
      title:
        updates.title ??
        existingJob.title,

      description:
        updates.description ??
        existingJob.description,

      location:
        updates.location ??
        existingJob.location,

      employmentType:
        updates.employmentType ??
        existingJob.employmentType,

      experienceLevel:
        updates.experienceLevel ??
        updates.roleLevel ??
        existingJob.experienceLevel,

      skills:
        updates.skills ??
        updates.requiredSkills ??
        existingJob.skills,

      status:
        updates.status ??
        existingJob.status
    }
  );
}

export async function deleteEmployerJob(
  jobId,
  employerId
) {
  const existingJob =
    await findJobById(jobId);

  if (!existingJob) {
    const error = new Error(
      "Job not found"
    );

    error.statusCode = 404;
    error.errorCode =
      "JOB_NOT_FOUND";

    throw error;
  }

  if (
    existingJob.employerId !== employerId
  ) {
    const error = new Error(
      "You do not have permission to delete this job"
    );

    error.statusCode = 403;
    error.errorCode =
      "JOB_ACCESS_FORBIDDEN";

    throw error;
  }

  const deleted =
    await deleteJobById(
      jobId,
      employerId
    );

  if (!deleted) {
    const error = new Error(
      "Unable to delete job"
    );

    error.statusCode = 400;
    error.errorCode =
      "JOB_DELETE_FAILED";

    throw error;
  }

  return true;
}

export async function closeEmployerJob(
  jobId,
  employerId
) {
  const existingJob =
    await findJobById(jobId);

  if (!existingJob) {
    const error = new Error(
      "Job not found"
    );

    error.statusCode = 404;
    error.errorCode =
      "JOB_NOT_FOUND";

    throw error;
  }

  if (
    existingJob.employerId !== employerId
  ) {
    const error = new Error(
      "You do not have permission to close this job"
    );

    error.statusCode = 403;
    error.errorCode =
      "JOB_ACCESS_FORBIDDEN";

    throw error;
  }

  if (
    existingJob.status === "closed"
  ) {
    const error = new Error(
      "Job is already closed"
    );

    error.statusCode = 400;
    error.errorCode =
      "JOB_ALREADY_CLOSED";

    throw error;
  }

  return updateJobById(
    jobId,
    employerId,
    {
      title:
        existingJob.title,

      description:
        existingJob.description,

      location:
        existingJob.location,

      employmentType:
        existingJob.employmentType,

      experienceLevel:
        existingJob.experienceLevel,

      skills:
        existingJob.skills,

      status: "closed"
    }
  );
}