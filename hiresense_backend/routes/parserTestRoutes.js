import express from "express";

import upload from "../middleware/upload.js";

import {
  parseDocument
} from "../services/documentParserService.js";

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

      const text = await parseDocument({
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname
      });

      return res.status(200).json({
        success: true,
        message: "Document parsed successfully",
        data: {
          filename: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          characters: text.length,
          textPreview: text.slice(0, 1000)
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;