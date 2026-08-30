import ResumeProfile from "../models/mongo/resumeProfileModel.js";
import { uploadResume } from "./cloudinaryService.js";
import {
  parseDocument,
  normalizeExtractedText
} from "./documentParserService.js";
import {
  parseResumeWithAI,
  analyzeResumeWithAI
} from "./aiService.js";

function createServiceError(
  message,
  statusCode,
  errorCode
) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errorCode = errorCode;
  return error;
}

function validateParsedResume(profile) {
  if (!profile || typeof profile !== "object") {
    throw createServiceError(
      "AI returned an invalid resume profile",
      502,
      "INVALID_AI_RESUME_PROFILE"
    );
  }

  if (
    typeof profile.name !== "string" ||
    !Array.isArray(profile.skills) ||
    typeof profile.experienceYears !== "number" ||
    !Number.isFinite(profile.experienceYears) ||
    !Array.isArray(profile.education) ||
    !Array.isArray(profile.workHistory)
  ) {
    throw createServiceError(
      "AI returned an invalid resume profile structure",
      502,
      "INVALID_AI_RESUME_PROFILE"
    );
  }

  if (
    profile.experienceYears < 0 ||
    profile.experienceYears > 100
  ) {
    throw createServiceError(
      "AI returned an invalid experience value",
      502,
      "INVALID_AI_RESUME_PROFILE"
    );
  }

  return profile;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item) =>
        typeof item === "string" &&
        item.trim().length > 0
    )
    .map((item) => item.trim());
}

function normalizeEducation(education) {
  if (!Array.isArray(education)) {
    return [];
  }

  return education
    .filter(
      (item) =>
        item &&
        typeof item === "object"
    )
    .map((item) => ({
      institution:
        typeof item.institution === "string"
          ? item.institution.trim()
          : "",
      degree:
        typeof item.degree === "string"
          ? item.degree.trim()
          : "",
      field:
        typeof item.field === "string"
          ? item.field.trim()
          : "",
      startYear:
        Number.isInteger(item.startYear) &&
        item.startYear >= 0
          ? item.startYear
          : null,
      endYear:
        Number.isInteger(item.endYear) &&
        item.endYear >= 0
          ? item.endYear
          : null,
      details:
        typeof item.details === "string"
          ? item.details.trim()
          : ""
    }));
}

function normalizeWorkHistory(workHistory) {
  if (!Array.isArray(workHistory)) {
    return [];
  }

  return workHistory
    .filter(
      (item) =>
        item &&
        typeof item === "object"
    )
    .map((item) => ({
      company:
        typeof item.company === "string"
          ? item.company.trim()
          : "",
      role:
        typeof item.role === "string"
          ? item.role.trim()
          : "",
      startDate:
        typeof item.startDate === "string"
          ? item.startDate.trim()
          : "",
      endDate:
        typeof item.endDate === "string"
          ? item.endDate.trim()
          : "",
      description:
        typeof item.description === "string"
          ? item.description.trim()
          : "",
      skills: normalizeStringArray(
        item.skills
      )
    }));
}

function normalizeParsedResume(profile) {
  const validated =
    validateParsedResume(profile);

  return {
    name: validated.name.trim(),
    skills: normalizeStringArray(
      validated.skills
    ),
    experienceYears: Math.max(
      0,
      Math.min(
        100,
        Number(validated.experienceYears)
      )
    ),
    education: normalizeEducation(
      validated.education
    ),
    workHistory: normalizeWorkHistory(
      validated.workHistory
    )
  };
}

function buildSourceDocument({
  uploadedDocument,
  file
}) {
  return {
    publicId:
      uploadedDocument.publicId,
    secureUrl:
      uploadedDocument.secureUrl,
    filename:
      file.originalname,
    mimeType:
      file.mimetype,
    size:
      file.size
  };
}

async function analyzeAndSaveProfile(profile) {
  const parsedResume =
    await parseResumeWithAI(
      profile.rawText
    );

  const normalizedProfile =
    normalizeParsedResume(
      parsedResume
    );

  profile.name =
    normalizedProfile.name;

  profile.skills =
    normalizedProfile.skills;

  profile.experienceYears =
    normalizedProfile.experienceYears;

  profile.education =
    normalizedProfile.education;

  profile.workHistory =
    normalizedProfile.workHistory;

  const resumeAnalysis =
    await analyzeResumeWithAI({
      name: profile.name,
      skills: profile.skills,
      experienceYears:
        profile.experienceYears,
      education: profile.education,
      workHistory:
        profile.workHistory
    });

  profile.resumeScore =
    resumeAnalysis.resumeScore;

  profile.resumeStrengths =
    resumeAnalysis.resumeStrengths;

  profile.resumeGaps =
    resumeAnalysis.resumeGaps;

  profile.aiStatus =
    "completed";

  profile.aiError =
    null;

  await profile.save();

  return profile;
}

export async function processResumeUpload({
  candidateId,
  file
}) {
  const normalizedCandidateId =
    Number(candidateId);

  if (
    !Number.isInteger(
      normalizedCandidateId
    ) ||
    normalizedCandidateId <= 0
  ) {
    throw createServiceError(
      "Invalid candidate ID",
      400,
      "INVALID_CANDIDATE_ID"
    );
  }

  if (!file) {
    throw createServiceError(
      "Resume file is required",
      400,
      "RESUME_FILE_REQUIRED"
    );
  }

  let uploadedDocument = null;
  let sourceDocument = null;
  let rawText = "";

  try {
    uploadedDocument =
      await uploadResume(
        file.buffer,
        file.originalname
      );

    sourceDocument =
      buildSourceDocument({
        uploadedDocument,
        file
      });

    const parsedDocument =
      await parseDocument({
        buffer: file.buffer,
        originalName:
          file.originalname,
        mimeType:
          file.mimetype
      });

    rawText =
      normalizeExtractedText(
        parsedDocument.text
      );

    if (!rawText) {
      throw createServiceError(
        "No readable text could be extracted from the resume",
        422,
        "RESUME_TEXT_EMPTY"
      );
    }

    let profile =
      await ResumeProfile.findOne({
        candidateId:
          normalizedCandidateId
      });

    if (!profile) {
      profile =
        new ResumeProfile({
          candidateId:
            normalizedCandidateId,
          name: "",
          skills: [],
          experienceYears: 0,
          education: [],
          workHistory: [],
          resumeScore: null,
          resumeStrengths: [],
          resumeGaps: [],
          sourceDocument,
          rawText
        });
    } else {
      profile.sourceDocument =
        sourceDocument;

      profile.rawText =
        rawText;
    }

    profile.aiStatus =
      "processing";

    profile.aiError =
      null;

    await profile.save();

    try {
      return await analyzeAndSaveProfile(
        profile
      );
    } catch (error) {
      profile.aiStatus =
        "failed";

      profile.aiError =
        error?.message ||
        "Resume AI analysis failed";

      await profile.save();

      throw error;
    }
  } catch (error) {
    if (
      error?.errorCode ===
      "RESUME_TEXT_EMPTY"
    ) {
      throw error;
    }

    if (
      sourceDocument &&
      rawText
    ) {
      try {
        const existingProfile =
          await ResumeProfile.findOne({
            candidateId:
              normalizedCandidateId
          });

        if (existingProfile) {
          existingProfile.sourceDocument =
            sourceDocument;

          existingProfile.rawText =
            rawText;

          existingProfile.aiStatus =
            "failed";

          existingProfile.aiError =
            error?.message ||
            "Resume processing failed";

          await existingProfile.save();
        }
      } catch {
        throw error;
      }
    }

    throw error;
  }
}

export async function retryResumeAI(candidateId) {
  const normalizedCandidateId =
    Number(candidateId);

  if (
    !Number.isInteger(
      normalizedCandidateId
    ) ||
    normalizedCandidateId <= 0
  ) {
    throw createServiceError(
      "Invalid candidate ID",
      400,
      "INVALID_CANDIDATE_ID"
    );
  }

  const profile =
    await ResumeProfile.findOne({
      candidateId:
        normalizedCandidateId
    });

  if (!profile) {
    throw createServiceError(
      "Resume profile not found",
      404,
      "RESUME_PROFILE_NOT_FOUND"
    );
  }

  if (!profile.rawText?.trim()) {
    throw createServiceError(
      "No extracted resume text is available for retry",
      422,
      "RESUME_TEXT_NOT_AVAILABLE"
    );
  }

  profile.aiStatus =
    "processing";

  profile.aiError =
    null;

  await profile.save();

  try {
    return await analyzeAndSaveProfile(
      profile
    );
  } catch (error) {
    profile.aiStatus =
      "failed";

    profile.aiError =
      error?.message ||
      "Resume AI retry failed";

    await profile.save();

    throw error;
  }
}

export const retryResumeProcessing =
  retryResumeAI;