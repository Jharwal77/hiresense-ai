const allowedRoleLevels = [
  "intern",
  "junior",
  "mid",
  "senior",
  "lead",
  "manager"
];

const allowedEmploymentTypes = [
  "full-time",
  "part-time",
  "contract",
  "internship"
];

export function validateCreateJob(req, res, next) {
  console.log("========== JOB REQUEST ==========");
  console.log("METHOD:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("CONTENT TYPE:", req.headers["content-type"]);
  console.log("BODY:", req.body);
  console.log("=================================");

  const errors = validateJobBody(
    req.body || {},
    true
  );

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

export function validateUpdateJob(
  req,
  res,
  next
) {
  const errors = validateJobBody(
    req.body || {},
    false
  );

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

function validateJobBody(
  body = {},
  required = false
) {
  const errors = [];

  if (required || body.title !== undefined) {
    if (
      typeof body.title !== "string" ||
      body.title.trim().length < 2 ||
      body.title.trim().length > 255
    ) {
      errors.push({
        field: "title",
        message:
          "Title must be between 2 and 255 characters"
      });
    }
  }

  if (
    required ||
    body.description !== undefined
  ) {
    if (
      typeof body.description !== "string" ||
      body.description.trim().length < 10
    ) {
      errors.push({
        field: "description",
        message:
          "Description must contain at least 10 characters"
      });
    }
  }

  if (
    required ||
    body.requiredSkills !== undefined
  ) {
    if (
      !Array.isArray(body.requiredSkills) ||
      body.requiredSkills.length === 0
    ) {
      errors.push({
        field: "requiredSkills",
        message:
          "At least one required skill is needed"
      });
    } else if (
      body.requiredSkills.length > 50
    ) {
      errors.push({
        field: "requiredSkills",
        message:
          "A maximum of 50 skills is allowed"
      });
    } else {
      const invalidSkill =
        body.requiredSkills.some(
          (skill) =>
            typeof skill !== "string" ||
            skill.trim().length === 0 ||
            skill.trim().length > 100
        );

      if (invalidSkill) {
        errors.push({
          field: "requiredSkills",
          message:
            "Every skill must be a non-empty string of maximum 100 characters"
        });
      }
    }
  }

  if (
    required ||
    body.experienceMin !== undefined
  ) {
    if (
      !isValidNumber(body.experienceMin) ||
      body.experienceMin < 0 ||
      body.experienceMin > 50
    ) {
      errors.push({
        field: "experienceMin",
        message:
          "Experience minimum must be between 0 and 50"
      });
    }
  }

  if (
    body.experienceMax !== undefined
  ) {
    if (
      body.experienceMax !== null &&
      (
        !isValidNumber(body.experienceMax) ||
        body.experienceMax < 0 ||
        body.experienceMax > 50
      )
    ) {
      errors.push({
        field: "experienceMax",
        message:
          "Experience maximum must be between 0 and 50"
      });
    }
  }

  if (
    body.experienceMin !== undefined &&
    body.experienceMax !== undefined &&
    body.experienceMax !== null &&
    isValidNumber(body.experienceMin) &&
    isValidNumber(body.experienceMax) &&
    body.experienceMax < body.experienceMin
  ) {
    errors.push({
      field: "experienceMax",
      message:
        "Experience maximum cannot be less than experience minimum"
    });
  }

  if (
    required ||
    body.roleLevel !== undefined
  ) {
    if (
      typeof body.roleLevel !== "string" ||
      !allowedRoleLevels.includes(
        body.roleLevel
      )
    ) {
      errors.push({
        field: "roleLevel",
        message:
          `Role level must be one of: ${allowedRoleLevels.join(", ")}`
      });
    }
  }

  if (
    body.location !== undefined &&
    body.location !== null
  ) {
    if (
      typeof body.location !== "string" ||
      body.location.trim().length > 255
    ) {
      errors.push({
        field: "location",
        message:
          "Location must be a maximum of 255 characters"
      });
    }
  }

  if (
    required ||
    body.employmentType !== undefined
  ) {
    if (
      typeof body.employmentType !== "string" ||
      !allowedEmploymentTypes.includes(
        body.employmentType
      )
    ) {
      errors.push({
        field: "employmentType",
        message:
          `Employment type must be one of: ${allowedEmploymentTypes.join(", ")}`
      });
    }
  }

  if (
    body.salaryMin !== undefined
  ) {
    if (
      body.salaryMin !== null &&
      (
        !isValidNumber(body.salaryMin) ||
        body.salaryMin < 0
      )
    ) {
      errors.push({
        field: "salaryMin",
        message:
          "Salary minimum must be a non-negative number"
      });
    }
  }

  if (
    body.salaryMax !== undefined
  ) {
    if (
      body.salaryMax !== null &&
      (
        !isValidNumber(body.salaryMax) ||
        body.salaryMax < 0
      )
    ) {
      errors.push({
        field: "salaryMax",
        message:
          "Salary maximum must be a non-negative number"
      });
    }
  }

  if (
    body.salaryMin !== undefined &&
    body.salaryMax !== undefined &&
    body.salaryMin !== null &&
    body.salaryMax !== null &&
    isValidNumber(body.salaryMin) &&
    isValidNumber(body.salaryMax) &&
    body.salaryMax < body.salaryMin
  ) {
    errors.push({
      field: "salaryMax",
      message:
        "Salary maximum cannot be less than salary minimum"
    });
  }

  return errors;
}

function isValidNumber(value) {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}