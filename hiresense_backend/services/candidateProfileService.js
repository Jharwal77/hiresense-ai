import ResumeProfile from "../models/mongo/resumeProfileModel.js";

export async function getCandidateProfile(candidateId) {
  const profile = await ResumeProfile.findOne({
    candidateId
  }).lean();

  if (!profile) {
    const error = new Error(
      "Resume profile not found"
    );

    error.statusCode = 404;
    error.errorCode =
      "RESUME_PROFILE_NOT_FOUND";

    throw error;
  }

  return profile;
}


export async function updateCandidateProfile(
  candidateId,
  updates
) {
  const allowedFields = [
    "name",
    "skills",
    "experienceYears",
    "education",
    "workHistory"
  ];

  const allowedUpdates = {};

  for (const field of allowedFields) {
    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        field
      )
    ) {
      allowedUpdates[field] =
        updates[field];
    }
  }

  if (
    Object.keys(allowedUpdates).length === 0
  ) {
    const error = new Error(
      "No valid profile fields provided"
    );

    error.statusCode = 400;
    error.errorCode =
      "NO_VALID_PROFILE_UPDATES";

    throw error;
  }

  const profile =
    await ResumeProfile.findOneAndUpdate(
      {
        candidateId
      },
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
    error.errorCode =
      "RESUME_PROFILE_NOT_FOUND";

    throw error;
  }

  return profile;
}