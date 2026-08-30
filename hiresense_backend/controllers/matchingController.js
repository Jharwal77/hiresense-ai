import {
  generateOrGetJobMatch,
  getJobMatch,
  generateInterviewQuestionsForJob
} from "../services/matchingService.js";

export async function matchJob(
  req,
  res,
  next
) {
  try {
    const jobId =
      Number(req.params.id);

    if (
      !Number.isInteger(jobId) ||
      jobId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
        errorCode:
          "INVALID_JOB_ID"
      });
    }

    const match =
      await generateOrGetJobMatch({
        candidateId:
          req.user.userId,
        jobId
      });

    return res.status(200).json({
      success: true,
      message:
        "Job match generated successfully",
      data: {
        match
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getExistingJobMatch(
  req,
  res,
  next
) {
  try {
    const jobId =
      Number(req.params.id);

    if (
      !Number.isInteger(jobId) ||
      jobId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
        errorCode:
          "INVALID_JOB_ID"
      });
    }

    const match =
      await getJobMatch({
        candidateId:
          req.user.userId,
        jobId
      });

    if (!match) {
      return res.status(404).json({
        success: false,
        message:
          "Job match not found",
        errorCode:
          "JOB_MATCH_NOT_FOUND"
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Job match retrieved successfully",
      data: {
        match
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getInterviewQuestions(
  req,
  res,
  next
) {
  try {
    const jobId =
      Number(req.params.id);

    if (
      !Number.isInteger(jobId) ||
      jobId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
        errorCode:
          "INVALID_JOB_ID"
      });
    }

    const match =
      await generateInterviewQuestionsForJob({
        candidateId:
          req.user.userId,
        jobId
      });

    return res.status(200).json({
      success: true,
      message:
        "Interview questions generated successfully",
      data: {
        questions:
          match.interviewQuestions
      }
    });
  } catch (error) {
    next(error);
  }
}

export const createJobMatch =
  matchJob;