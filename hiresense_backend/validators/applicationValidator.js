const allowedStatuses = [
  "applied",
  "shortlisted",
  "rejected",
  "hired"
];

export function validateApplicationStatus(
  req,
  res,
  next
) {
  const errors = [];

  const applicationId =
    Number(req.params.id);

  if (
    !Number.isInteger(applicationId) ||
    applicationId <= 0
  ) {
    errors.push({
      field: "id",
      message: "Application ID must be a positive integer"
    });
  }

  const body = req.body || {};

  if (
    !body.status ||
    !allowedStatuses.includes(body.status)
  ) {
    errors.push({
      field: "status",
      message:
        "Status must be one of: applied, shortlisted, rejected, hired"
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errorCode: "VALIDATION_ERROR",
      errors
    });
  }

  next();
}

export { allowedStatuses };