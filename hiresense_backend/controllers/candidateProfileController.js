import {
  getCandidateProfile,
  updateCandidateProfile
} from "../services/candidateProfileService.js";

export async function getMyProfile(req, res, next) {
  try {
    const profile = await getCandidateProfile(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Candidate profile retrieved successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const profile =
      await updateCandidateProfile(
        req.user.userId,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Candidate profile updated successfully",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
}