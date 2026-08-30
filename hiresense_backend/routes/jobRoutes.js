import express from "express";

import {
  createJob,
  listJobs,
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
  listJobs
);

router.get(
  "/my",
  authenticate,
  requireRole("employer"),
  listMyJobs
);



router.get(
  "/:id/applications",
  authenticate,
  requireRole("employer"),
  listJobApplications
);

router.post(
  "/:id/match",
  authenticate,
  requireRole("candidate"),
  matchJob
);

router.get(
  "/:id/questions",
  authenticate,
  requireRole("candidate"),
  getInterviewQuestions
);

router.get(
  "/:id",
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
  authenticate,
  requireRole("candidate"),
  applyToJob
);



router.patch(
  "/:id",
  authenticate,
  requireRole("employer"),
  validateUpdateJob,
  updateJob
);


router.patch(
  "/:id/close",
  authenticate,
  requireRole("employer"),
  closeJob
);


router.delete(
  "/:id",
  authenticate,
  requireRole("employer"),
  deleteJob
);

export default router;