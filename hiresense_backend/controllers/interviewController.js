import {
  generateInterviewQuestionsForJob
} from "../services/matchingService.js";

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

    const result =
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
          result.interviewQuestions
      }
    });
  } catch (error) {
    next(error);
  }
}