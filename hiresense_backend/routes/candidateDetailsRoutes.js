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

import {
  validatePositiveInteger
} from "../middleware/validateId.js";

const router = express.Router();


router.get(
  "/:id",
  validatePositiveInteger(
    "id",
    "Candidate ID"
  ),
  authenticate,
  requireRole("employer"),
  getCandidateDetails
);


export default router;