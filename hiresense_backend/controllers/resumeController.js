import {
  processResumeUpload,
  retryResumeAI
} from "../services/resumeService.js";

import ResumeProfile from "../models/mongo/resumeProfileModel.js";

export async function uploadResume(
  req,
  res,
  next
) {
  try {
    const profile =
      await processResumeUpload({
        candidateId:
          req.user.userId,
        file: req.file
      });

    return res.status(200).json({
      success: true,
      message:
        "Resume processed successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyResumeProfile(
  req,
  res,
  next
) {
  try {
    const profile =
      await ResumeProfile.findOne({
        candidateId:
          req.user.userId
      });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message:
          "Resume profile not found",
        errorCode:
          "RESUME_PROFILE_NOT_FOUND"
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Resume profile retrieved successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMyResumeProfile(
  req,
  res,
  next
) {
  try {
    const profile =
      await ResumeProfile.findOne({
        candidateId:
          req.user.userId
      });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message:
          "Resume profile not found",
        errorCode:
          "RESUME_PROFILE_NOT_FOUND"
      });
    }

    const {
      name,
      skills,
      experienceYears,
      education,
      workHistory
    } = req.body || {};

    if (
      name !== undefined
    ) {
      profile.name =
        String(name).trim();
    }

    if (
      skills !== undefined
    ) {
      if (!Array.isArray(skills)) {
        return res.status(400).json({
          success: false,
          message:
            "Skills must be an array",
          errorCode:
            "INVALID_SKILLS"
        });
      }

      profile.skills =
        skills
          .map((skill) =>
            String(skill).trim()
          )
          .filter(Boolean);
    }

    if (
      experienceYears !== undefined
    ) {
      const years =
        Number(experienceYears);

      if (
        !Number.isFinite(years) ||
        years < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid experience years",
          errorCode:
            "INVALID_EXPERIENCE_YEARS"
        });
      }

      profile.experienceYears =
        years;
    }

    if (
      education !== undefined
    ) {
      if (!Array.isArray(education)) {
        return res.status(400).json({
          success: false,
          message:
            "Education must be an array",
          errorCode:
            "INVALID_EDUCATION"
        });
      }

      profile.education =
        education;
    }

    if (
      workHistory !== undefined
    ) {
      if (
        !Array.isArray(workHistory)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Work history must be an array",
          errorCode:
            "INVALID_WORK_HISTORY"
        });
      }

      profile.workHistory =
        workHistory;
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message:
        "Resume profile updated successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function retryResumeAIController(
  req,
  res,
  next
) {
  try {
    const profile =
      await retryResumeAI(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Resume AI analysis completed successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
}