import ResumeProfile from "../models/mongo/resumeProfileModel.js";

export async function getCandidateProfile(candidateId) {
  const profile = await ResumeProfile.findOne({
    candidateId
  });

  if (!profile) {
    const error = new Error(
      "Resume profile not found"
    );

    error.statusCode = 404;
    error.errorCode = "RESUME_PROFILE_NOT_FOUND";

    throw error;
  }

  return profile;
}

export async function updateCandidateProfile(
  candidateId,
  updates
) {
  const allowedUpdates = {
    name: updates.name,
    skills: updates.skills,
    experienceYears:
      updates.experienceYears,
    education: updates.education,
    workHistory: updates.workHistory
  };

  const profile =
    await ResumeProfile.findOneAndUpdate(
      { candidateId },
      {
        $set: allowedUpdates
      },
      {
        new: true,
        runValidators: true
      }
    );

  if (!profile) {
    const error = new Error(
      "Resume profile not found"
    );

    error.statusCode = 404;
    error.errorCode = "RESUME_PROFILE_NOT_FOUND";

    throw error;
  }

  return profile;
}