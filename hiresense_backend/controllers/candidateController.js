import { processResumeUpload } from "../services/resumeService.js";

export async function uploadResume(req, res, next) {
  try {
    const resumeProfile =
      await processResumeUpload({
        candidateId: req.user.userId,
        file: req.file
      });

    return res.status(201).json({
      success: true,
      message: "Resume uploaded and processed successfully",
      data: {
        resume: resumeProfile
      }
    });
  } catch (error) {
    next(error);
  }
}