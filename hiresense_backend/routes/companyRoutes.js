import express from "express";

import {
  createCompany,
  getMyCompany,
  updateMyCompany
} from "../controllers/companyController.js";

import {
  authenticate
} from "../middleware/authenticate.js";

import {
  requireRole
} from "../middleware/requireRole.js";

import {
  validateCreateCompany,
  validateUpdateCompany
} from "../validators/companyValidator.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  requireRole("employer"),
  validateCreateCompany,
  createCompany
);

router.get(
  "/me",
  authenticate,
  requireRole("employer"),
  getMyCompany
);

router.patch(
  "/me",
  authenticate,
  requireRole("employer"),
  validateUpdateCompany,
  updateMyCompany
);

export default router;