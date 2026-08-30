import express from "express";

import {
  updateApplicationStatus
} from "../controllers/applicationController.js";

import {
  authenticate
} from "../middleware/authenticate.js";

import {
  requireRole
} from "../middleware/requireRole.js";

import {
  validateApplicationStatus
} from "../validators/applicationValidator.js";

const router = express.Router();

router.patch(
  "/:id/status",
  authenticate,
  requireRole("employer"),
  validateApplicationStatus,
  updateApplicationStatus
);

export default router;