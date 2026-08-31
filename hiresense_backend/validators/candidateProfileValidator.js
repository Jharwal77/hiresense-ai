const allowedFields = [
  "name",
  "skills",
  "experienceYears",
  "education",
  "workHistory"
];

function sendValidationError(
  res,
  message,
  errorCode = "VALIDATION_ERROR"
) {
  return res.status(400).json({
    success: false,
    message,
    errorCode
  });
}

function validateString(
  value,
  fieldName,
  {
    required = false,
    maxLength = 500
  } = {}
) {
  if (
    value === undefined ||
    value === null
  ) {
    if (required) {
      return `${fieldName} is required`;
    }

    return null;
  }

  if (typeof value !== "string") {
    return `${fieldName} must be a string`;
  }

  if (
    required &&
    value.trim().length === 0
  ) {
    return `${fieldName} cannot be empty`;
  }

  if (
    value.length > maxLength
  ) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }

  return null;
}

function validateSkills(skills) {
  if (!Array.isArray(skills)) {
    return "skills must be an array";
  }

  if (skills.length > 100) {
    return "skills cannot contain more than 100 items";
  }

  for (const skill of skills) {
    if (typeof skill !== "string") {
      return "Each skill must be a string";
    }

    if (
      skill.trim().length === 0
    ) {
      return "Skills cannot contain empty values";
    }

    if (
      skill.length > 100
    ) {
      return "Each skill must not exceed 100 characters";
    }
  }

  return null;
}

function validateExperienceYears(
  experienceYears
) {
  if (
    typeof experienceYears !== "number" ||
    !Number.isFinite(experienceYears)
  ) {
    return "experienceYears must be a valid number";
  }

  if (experienceYears < 0) {
    return "experienceYears cannot be negative";
  }

  if (experienceYears > 60) {
    return "experienceYears cannot exceed 60";
  }

  return null;
}

function validateEducation(education) {
  if (!Array.isArray(education)) {
    return "education must be an array";
  }

  if (education.length > 20) {
    return "education cannot contain more than 20 items";
  }

  for (const item of education) {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item)
    ) {
      return "Each education entry must be an object";
    }

    const allowedEducationFields = [
      "institution",
      "degree",
      "field",
      "startYear",
      "endYear",
      "details"
    ];

    for (
      const key of Object.keys(item)
    ) {
      if (
        !allowedEducationFields.includes(key)
      ) {
        return `Unknown education field: ${key}`;
      }
    }

    const stringFields = [
      "institution",
      "degree",
      "field",
      "details"
    ];

    for (const field of stringFields) {
      if (
        item[field] !== undefined
      ) {
        const error =
          validateString(
            item[field],
            `education.${field}`,
            {
              maxLength:
                field === "details"
                  ? 2000
                  : 300
            }
          );

        if (error) {
          return error;
        }
      }
    }

    for (
      const field of [
        "startYear",
        "endYear"
      ]
    ) {
      if (
        item[field] !== undefined &&
        item[field] !== null
      ) {
        if (
          !Number.isInteger(item[field])
        ) {
          return `education.${field} must be an integer`;
        }

        if (
          item[field] < 1900 ||
          item[field] > 2100
        ) {
          return `education.${field} must be between 1900 and 2100`;
        }
      }
    }

    if (
      Number.isInteger(item.startYear) &&
      Number.isInteger(item.endYear) &&
      item.endYear < item.startYear
    ) {
      return "education.endYear cannot be earlier than education.startYear";
    }
  }

  return null;
}

function validateWorkHistory(
  workHistory
) {
  if (!Array.isArray(workHistory)) {
    return "workHistory must be an array";
  }

  if (workHistory.length > 50) {
    return "workHistory cannot contain more than 50 items";
  }

  for (const item of workHistory) {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item)
    ) {
      return "Each workHistory entry must be an object";
    }

    const allowedWorkFields = [
      "company",
      "role",
      "startDate",
      "endDate",
      "description",
      "skills"
    ];

    for (
      const key of Object.keys(item)
    ) {
      if (
        !allowedWorkFields.includes(key)
      ) {
        return `Unknown workHistory field: ${key}`;
      }
    }

    const stringFields = [
      "company",
      "role",
      "startDate",
      "endDate",
      "description"
    ];

    for (const field of stringFields) {
      if (
        item[field] !== undefined
      ) {
        const error =
          validateString(
            item[field],
            `workHistory.${field}`,
            {
              maxLength:
                field === "description"
                  ? 5000
                  : 500
            }
          );

        if (error) {
          return error;
        }
      }
    }

    if (
      item.skills !== undefined
    ) {
      const error =
        validateSkills(item.skills);

      if (error) {
        return `workHistory.skills: ${error}`;
      }
    }
  }

  return null;
}

export function validateCandidateProfile(
  req,
  res,
  next
) {
  try {
    const body = req.body;

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return sendValidationError(
        res,
        "Request body must be a JSON object"
      );
    }

    const keys =
      Object.keys(body);

    if (keys.length === 0) {
      return sendValidationError(
        res,
        "At least one profile field must be provided"
      );
    }

    for (const key of keys) {
      if (
        !allowedFields.includes(key)
      ) {
        return sendValidationError(
          res,
          `Unknown profile field: ${key}`,
          "UNKNOWN_FIELD"
        );
      }
    }

    if (
      body.name !== undefined
    ) {
      const error =
        validateString(
          body.name,
          "name",
          {
            required: true,
            maxLength: 150
          }
        );

      if (error) {
        return sendValidationError(
          res,
          error
        );
      }
    }

    if (
      body.skills !== undefined
    ) {
      const error =
        validateSkills(body.skills);

      if (error) {
        return sendValidationError(
          res,
          error
        );
      }
    }

    if (
      body.experienceYears !== undefined
    ) {
      const error =
        validateExperienceYears(
          body.experienceYears
        );

      if (error) {
        return sendValidationError(
          res,
          error
        );
      }
    }

    if (
      body.education !== undefined
    ) {
      const error =
        validateEducation(
          body.education
        );

      if (error) {
        return sendValidationError(
          res,
          error
        );
      }
    }

    if (
      body.workHistory !== undefined
    ) {
      const error =
        validateWorkHistory(
          body.workHistory
        );

      if (error) {
        return sendValidationError(
          res,
          error
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

export default validateCandidateProfile;