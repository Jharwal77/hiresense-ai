import {
  getCandidateApplications,
  updateApplicationStatus as updateApplicationStatusService
} from "../services/applicationService.js";


// =====================================
// CANDIDATE - GET MY APPLICATIONS
// =====================================

export async function listMyApplications(
  req,
  res,
  next
) {
  try {
    const applications =
      await getCandidateApplications(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Candidate applications retrieved successfully",
      data: {
        applications
      }
    });
  } catch (error) {
    next(error);
  }
}


// =====================================
// EMPLOYER - UPDATE APPLICATION STATUS
// =====================================

export async function updateApplicationStatus(
  req,
  res,
  next
) {
  try {
    const application =
      await updateApplicationStatusService({
        applicationId:
          Number(req.params.id),

        employerId:
          req.user.userId,

        status:
          req.body.status
      });

    return res.status(200).json({
      success: true,
      message:
        "Application status updated successfully",
      data: {
        application
      }
    });
  } catch (error) {
    next(error);
  }
}