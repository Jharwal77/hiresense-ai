import express from "express";

import {
  uploadResume
} from "../controllers/candidateController.js";

import {
  getMyProfile,
  updateMyProfile
} from "../controllers/candidateProfileController.js";

import {
  listMyApplications
} from "../controllers/applicationController.js";

import { authenticate } from "../middleware/authenticate.js";

import { requireRole } from "../middleware/requireRole.js";

import upload from "../middleware/upload.js";

import {
  retryResumeAIController
} from "../controllers/resumeController.js";

const router = express.Router();


router.post(
  "/resume",
  authenticate,
  requireRole("candidate"),
  upload.single("resume"),
  uploadResume
);



router.get(
  "/me/applications",
  authenticate,
  requireRole("candidate"),
  listMyApplications
);


router.post(
  "/resume/retry",
  authenticate,
  requireRole("candidate"),
  retryResumeAIController
);


router.get(
  "/me/profile",
  authenticate,
  requireRole("candidate"),
  getMyProfile
);

router.patch(
  "/me/profile",
  authenticate,
  requireRole("candidate"),
  updateMyProfile
);


export default router;