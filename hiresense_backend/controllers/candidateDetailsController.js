import {
  getEmployerCandidateDetails
} from "../services/candidateDetailsService.js";

export async function getCandidateDetails(
  req,
  res,
  next
) {
  try {
    const candidateId =
      Number(req.params.id);

    if (
      !Number.isInteger(candidateId) ||
      candidateId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID",
        errorCode:
          "INVALID_CANDIDATE_ID"
      });
    }

    const data =
      await getEmployerCandidateDetails({
        candidateId,
        employerId:
          req.user.userId
      });

    return res.status(200).json({
      success: true,
      message:
        "Candidate details retrieved successfully",
      data
    });
  } catch (error) {
    next(error);
  }
}