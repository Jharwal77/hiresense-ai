import {
  createJob as createJobModel,
  findJobById,
  findJobs,
  findJobsByEmployerId,
  updateJobById,
  deleteJobById,
  closeJobById
} from "../models/mysql/jobModel.js";

import {
  findCompanyByEmployerId
} from "../models/mysql/companyModel.js";

export async function createEmployerJob({
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
  const company =
    await findCompanyByEmployerId(employerId);

  if (!company) {
    const error = new Error(
      "Create a company profile before posting a job"
    );

    error.statusCode = 400;
    error.errorCode = "COMPANY_PROFILE_REQUIRED";

    throw error;
  }

  return createJobModel({
    companyId: company.id,
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
  });
}

export async function getJob(id) {
  const job = await findJobById(id);

  if (!job) {
    const error = new Error(
      "Job not found"
    );

    error.statusCode = 404;
    error.errorCode = "JOB_NOT_FOUND";

    throw error;
  }

  return job;
}

export async function getPublicJobs(filters = {}) {
  return findJobs({
    search: filters.search,
    location: filters.location,
    roleLevel: filters.roleLevel,
    employmentType: filters.employmentType,
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
    error.errorCode = "JOB_NOT_FOUND";

    throw error;
  }

  if (
    existingJob.employerId !== employerId
  ) {
    const error = new Error(
      "You do not have permission to modify this job"
    );

    error.statusCode = 403;
    error.errorCode = "JOB_ACCESS_FORBIDDEN";

    throw error;
  }

  if (existingJob.status === "closed") {
    const error = new Error(
      "Closed jobs cannot be edited"
    );

    error.statusCode = 400;
    error.errorCode = "JOB_ALREADY_CLOSED";

    throw error;
  }

  const updatedJob =
    await updateJobById(
      jobId,
      employerId,
      {
        title:
          updates.title ??
          existingJob.title,

        description:
          updates.description ??
          existingJob.description,

        requiredSkills:
          updates.requiredSkills ??
          existingJob.requiredSkills,

        experienceMin:
          updates.experienceMin ??
          existingJob.experienceMin,

        experienceMax:
          updates.experienceMax ??
          existingJob.experienceMax,

        roleLevel:
          updates.roleLevel ??
          existingJob.roleLevel,

        location:
          updates.location ??
          existingJob.location,

        employmentType:
          updates.employmentType ??
          existingJob.employmentType,

        salaryMin:
          updates.salaryMin ??
          existingJob.salaryMin,

        salaryMax:
          updates.salaryMax ??
          existingJob.salaryMax
      }
    );

  if (!updatedJob) {
    const error = new Error(
      "Unable to update job"
    );

    error.statusCode = 400;
    error.errorCode = "JOB_UPDATE_FAILED";

    throw error;
  }

  return updatedJob;
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
    error.errorCode = "JOB_NOT_FOUND";

    throw error;
  }

  if (
    existingJob.employerId !== employerId
  ) {
    const error = new Error(
      "You do not have permission to delete this job"
    );

    error.statusCode = 403;
    error.errorCode = "JOB_ACCESS_FORBIDDEN";

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
    error.errorCode = "JOB_DELETE_FAILED";

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
    error.errorCode = "JOB_NOT_FOUND";

    throw error;
  }

  if (
    existingJob.employerId !== employerId
  ) {
    const error = new Error(
      "You do not have permission to close this job"
    );

    error.statusCode = 403;
    error.errorCode = "JOB_ACCESS_FORBIDDEN";

    throw error;
  }

  if (existingJob.status === "closed") {
    const error = new Error(
      "Job is already closed"
    );

    error.statusCode = 400;
    error.errorCode = "JOB_ALREADY_CLOSED";

    throw error;
  }

  const closed =
    await closeJobById(
      jobId,
      employerId
    );

  if (!closed) {
    const error = new Error(
      "Unable to close job"
    );

    error.statusCode = 400;
    error.errorCode = "JOB_CLOSE_FAILED";

    throw error;
  }

  return findJobById(jobId);
}