const allowedFields = [
  "name",
  "description",
  "website",
  "location"
];

function validateCompany(req, res, next) {
  const body = req.body || {};

  const fields = Object.keys(body);

  for (const field of fields) {
    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        message: `Unknown company field: ${field}`,
        errorCode: "UNKNOWN_FIELD"
      });
    }
  }

  if (
    body.name !== undefined &&
    (
      typeof body.name !== "string" ||
      body.name.trim().length < 2 ||
      body.name.trim().length > 150
    )
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Company name must be between 2 and 150 characters",
      errorCode: "VALIDATION_ERROR"
    });
  }

  if (
    body.description !== undefined &&
    (
      typeof body.description !== "string" ||
      body.description.trim().length > 2000
    )
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Company description must not exceed 2000 characters",
      errorCode: "VALIDATION_ERROR"
    });
  }

  if (
    body.location !== undefined &&
    (
      typeof body.location !== "string" ||
      body.location.trim().length > 255
    )
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Company location must not exceed 255 characters",
      errorCode: "VALIDATION_ERROR"
    });
  }

  if (
    body.website !== undefined &&
    body.website !== null &&
    body.website !== ""
  ) {
    if (typeof body.website !== "string") {
      return res.status(400).json({
        success: false,
        message: "Website must be a valid URL",
        errorCode: "VALIDATION_ERROR"
      });
    }

    try {
      const url = new URL(body.website);

      if (
        url.protocol !== "http:" &&
        url.protocol !== "https:"
      ) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return res.status(400).json({
        success: false,
        message: "Website must be a valid HTTP or HTTPS URL",
        errorCode: "VALIDATION_ERROR"
      });
    }
  }

  next();
}

function validateCreateCompany(req, res, next) {
  if (
    !req.body ||
    !req.body.name
  ) {
    return res.status(400).json({
      success: false,
      message: "Company name is required",
      errorCode: "VALIDATION_ERROR"
    });
  }

  return validateCompany(
    req,
    res,
    next
  );
}

function validateUpdateCompany(req, res, next) {
  const body = req.body || {};

  if (
    Object.keys(body).length === 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "At least one company field is required",
      errorCode: "VALIDATION_ERROR"
    });
  }

  return validateCompany(
    req,
    res,
    next
  );
}

export {
  validateCreateCompany,
  validateUpdateCompany
};