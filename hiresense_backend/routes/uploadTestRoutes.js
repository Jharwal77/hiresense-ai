import express from "express";

import upload from "../middleware/upload.js";

import { uploadResume } from "../services/cloudinaryService.js";

const router = express.Router();

router.post(
  "/",
  upload.single("resume"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Resume file is required",
          errorCode: "FILE_REQUIRED"
        });
      }

      const result = await uploadResume(
        req.file.buffer,
        req.file.originalname
      );

      return res.status(201).json({
        success: true,
        message: "File uploaded successfully",
        data: {
          file: result
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;