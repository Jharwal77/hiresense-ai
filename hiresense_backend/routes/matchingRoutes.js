import express from "express";

import {
  createJobMatch,
  getExistingJobMatch,
  getInterviewQuestions
} from "../controllers/matchingController.js";

import authenticate from "../middleware/authenticate.js";

import { requireRole } from "../middleware/requireRole.js";

const router =
  express.Router();

router.post(
  "/jobs/:id/match",
  authenticate,
  requireRole("candidate"),
  createJobMatch
);

router.get(
  "/jobs/:id/match",
  authenticate,
  requireRole("candidate"),
  getExistingJobMatch
);

router.get(
  "/jobs/:id/interview-questions",
  authenticate,
  requireRole("candidate"),
  getInterviewQuestions
);

export default router;