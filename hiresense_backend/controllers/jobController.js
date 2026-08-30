import {
  createEmployerJob,
  getJob,
  getPublicJobs,
  getEmployerJobs,
  updateEmployerJob,
  deleteEmployerJob,
  closeEmployerJob
} from "../services/jobService.js";

import {
  applyForJob,
  getJobApplications
} from "../services/applicationService.js";

import {
  aggregateAdzunaJobs
} from "../services/jobAggregationService.js";

import {
  findJobs
} from "../models/mysql/jobModel.js";

export async function getJobs(req, res, next) {
  try {
    const {
      search,
      location,
      roleLevel,
      employmentType,
      source,
      minSalary,
      maxSalary,
      minExperience,
      maxExperience
    } = req.query;

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 20,
        1
      ),
      100
    );

    const normalizedSource =
      typeof source === "string"
        ? source.trim().toLowerCase()
        : "";

    if (
      normalizedSource === "" ||
      normalizedSource === "adzuna"
    ) {
      try {
        await aggregateAdzunaJobs({
          country: "in",
          page: 1,
          resultsPerPage: limit,
          search,
          location
        });
      } catch (error) {
        console.error(
          "Adzuna aggregation failed:",
          error.message
        );
      }
    }

    const jobs = await findJobs({
      search,
      location,
      roleLevel,
      employmentType,
      source:
        normalizedSource || undefined,
      minSalary,
      maxSalary,
      minExperience,
      maxExperience,
      status: "open"
    });

    const total = jobs.length;

    const totalPages =
      Math.ceil(total / limit);

    const startIndex =
      (page - 1) * limit;

    const paginatedJobs =
      jobs.slice(
        startIndex,
        startIndex + limit
      );

    return res.status(200).json({
      success: true,
      message: "Jobs retrieved successfully",
      data: {
        jobs: paginatedJobs,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage:
            page < totalPages,
          hasPreviousPage:
            page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createJob(req, res, next) {
  try {
    const body = req.body || {};

    const job = await createEmployerJob({
      employerId: req.user.userId,
      title: body.title,
      description: body.description,
      requiredSkills: body.requiredSkills,
      experienceMin: body.experienceMin,
      experienceMax: body.experienceMax,
      roleLevel: body.roleLevel,
      location: body.location,
      employmentType: body.employmentType,
      salaryMin: body.salaryMin,
      salaryMax: body.salaryMax
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: {
        job
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function listJobs(req, res, next) {
  try {
    const {
      search,
      location,
      roleLevel,
      employmentType,
      source,
      minSalary,
      maxSalary,
      minExperience,
      maxExperience
    } = req.query;

    const jobs = await findJobs({
      search,
      location,
      roleLevel,
      employmentType,
      source,
      minSalary,
      maxSalary,
      minExperience,
      maxExperience,
      status: "open"
    });

    return res.status(200).json({
      success: true,
      message: "Jobs retrieved successfully",
      data: {
        jobs
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getJobById(req, res, next) {
  try {
    const jobId =
      Number(req.params.id);

    if (
      !Number.isInteger(jobId) ||
      jobId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
        errorCode: "INVALID_JOB_ID"
      });
    }

    const job =
      await getJob(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
        errorCode: "JOB_NOT_FOUND"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job retrieved successfully",
      data: {
        job
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function listMyJobs(req, res, next) {
  try {
    const jobs =
      await getEmployerJobs(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Employer jobs retrieved successfully",
      data: {
        jobs
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateJob(req, res, next) {
  try {
    const jobId =
      Number(req.params.id);

    if (
      !Number.isInteger(jobId) ||
      jobId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
        errorCode: "INVALID_JOB_ID"
      });
    }

    const job =
      await updateEmployerJob(
        jobId,
        req.user.userId,
        req.body || {}
      );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
        errorCode: "JOB_NOT_FOUND"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: {
        job
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteJob(req, res, next) {
  try {
    const jobId =
      Number(req.params.id);

    if (
      !Number.isInteger(jobId) ||
      jobId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
        errorCode: "INVALID_JOB_ID"
      });
    }

    const deleted =
      await deleteEmployerJob(
        jobId,
        req.user.userId
      );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
        errorCode: "JOB_NOT_FOUND"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}

export async function closeJob(req, res, next) {
  try {
    const jobId =
      Number(req.params.id);

    if (
      !Number.isInteger(jobId) ||
      jobId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
        errorCode: "INVALID_JOB_ID"
      });
    }

    const job =
      await closeEmployerJob(
        jobId,
        req.user.userId
      );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
        errorCode: "JOB_NOT_FOUND"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job closed successfully",
      data: {
        job
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function applyToJob(req, res, next) {
  try {
    const jobId =
      Number(req.params.id);

    if (
      !Number.isInteger(jobId) ||
      jobId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
        errorCode: "INVALID_JOB_ID"
      });
    }

    const job =
      await getJob(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
        errorCode: "JOB_NOT_FOUND"
      });
    }

    if (job.isExternal) {
      return res.status(400).json({
        success: false,
        message:
          "External jobs must be applied for on the original job website",
        errorCode:
          "EXTERNAL_JOB_APPLICATION"
      });
    }

    const application =
      await applyForJob({
        jobId,
        candidateId:
          req.user.userId
      });

    return res.status(201).json({
      success: true,
      message:
        "Application submitted successfully",
      data: {
        application
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function listJobApplications(
  req,
  res,
  next
) {
  try {
    const jobId =
      Number(req.params.id);

    if (
      !Number.isInteger(jobId) ||
      jobId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
        errorCode: "INVALID_JOB_ID"
      });
    }

    const result =
      await getJobApplications({
        jobId,
        employerId:
          req.user.userId
      });

    return res.status(200).json({
      success: true,
      message:
        "Job applications retrieved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
}