import express from "express";

import {
  createJob,
  getJobs,
  getJobById,
  listMyJobs,
  updateJob,
  deleteJob,
  closeJob,
  applyToJob,
  listJobApplications
} from "../controllers/jobController.js";

import {
  authenticate
} from "../middleware/authenticate.js";

import {
  requireRole
} from "../middleware/requireRole.js";

import {
  validatePositiveInteger
} from "../middleware/validateId.js";

import {
  validateCreateJob,
  validateUpdateJob
} from "../validators/jobValidator.js";

import {
  matchJob
} from "../controllers/matchingController.js";

import {
  getInterviewQuestions
} from "../controllers/interviewController.js";

const router = express.Router();


router.get(
  "/",
  getJobs
);


router.get(
  "/my",
  authenticate,
  requireRole("employer"),
  listMyJobs
);


router.get(
  "/:id/applications",
  validatePositiveInteger("id", "Job ID"),
  authenticate,
  requireRole("employer"),
  listJobApplications
);


router.post(
  "/:id/match",
  validatePositiveInteger("id", "Job ID"),
  authenticate,
  requireRole("candidate"),
  matchJob
);


router.get(
  "/:id/questions",
  validatePositiveInteger("id", "Job ID"),
  authenticate,
  requireRole("candidate"),
  getInterviewQuestions
);


router.get(
  "/:id",
  validatePositiveInteger("id", "Job ID"),
  getJobById
);


router.post(
  "/",
  authenticate,
  requireRole("employer"),
  validateCreateJob,
  createJob
);


router.post(
  "/:id/apply",
  validatePositiveInteger("id", "Job ID"),
  authenticate,
  requireRole("candidate"),
  applyToJob
);


router.patch(
  "/:id",
  validatePositiveInteger("id", "Job ID"),
  authenticate,
  requireRole("employer"),
  validateUpdateJob,
  updateJob
);


router.patch(
  "/:id/close",
  validatePositiveInteger("id", "Job ID"),
  authenticate,
  requireRole("employer"),
  closeJob
);


router.delete(
  "/:id",
  validatePositiveInteger("id", "Job ID"),
  authenticate,
  requireRole("employer"),
  deleteJob
);


export default router;