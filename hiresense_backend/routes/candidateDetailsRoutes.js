import express from "express";

import {
  getCandidateDetails
} from "../controllers/candidateDetailsController.js";

import {
  authenticate
} from "../middleware/authenticate.js";

import {
  requireRole
} from "../middleware/requireRole.js";

const router = express.Router();

router.get(
  "/:id",
  authenticate,
  requireRole("employer"),
  getCandidateDetails
);

export default router;