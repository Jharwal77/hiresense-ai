import { GoogleGenAI } from "@google/genai";
import env from "../config/env.js";

const ai = new GoogleGenAI({
  apiKey: env.gemini.apiKey
});

const MODEL = "gemini-3.6-flash";

/*
|--------------------------------------------------------------------------
| RESUME PARSING
|--------------------------------------------------------------------------
*/

export async function parseResumeWithAI(rawText) {
  if (!rawText || !rawText.trim()) {
    const error = new Error(
      "Resume text is required for AI parsing"
    );

    error.statusCode = 400;
    error.errorCode =
      "RESUME_TEXT_REQUIRED";

    throw error;
  }

  const prompt = `
You are a resume parsing system.

Extract information ONLY from the resume text provided below.

Never invent, assume, infer, or fabricate information.

If information is not explicitly available:
- use an empty string for missing text fields
- use an empty array for missing arrays
- use 0 for missing experienceYears
- use 0 for missing education years

Return ONLY valid JSON.

Do not use markdown.
Do not include explanations outside the JSON.

The JSON structure must be exactly:

{
  "name": "",
  "skills": [],
  "experienceYears": 0,
  "education": [],
  "workHistory": []
}

Education objects must use:

{
  "institution": "",
  "degree": "",
  "field": "",
  "startYear": 0,
  "endYear": 0,
  "details": ""
}

Work history objects must use:

{
  "company": "",
  "role": "",
  "startDate": "",
  "endDate": "",
  "description": "",
  "skills": []
}

Rules:

1. Extract only information explicitly present in the resume.
2. Do not create skills that are not mentioned.
3. Do not create companies, jobs, degrees, dates, or institutions.
4. experienceYears must be based only on explicitly stated professional experience.
5. Do not count education as work experience.
6. If a year is unavailable, use 0.
7. Keep skills as concise names.
8. Preserve the meaning of work descriptions.
9. Return JSON only.

Resume text:

${rawText}
`;

  const interaction =
    await ai.interactions.create({
      model: MODEL,
      input: prompt
    });

  const text =
    interaction.output_text;

  if (!text) {
    const error = new Error(
      "Gemini returned an empty response"
    );

    error.statusCode = 502;
    error.errorCode =
      "EMPTY_AI_RESPONSE";

    throw error;
  }

  return parseAndValidateAIResponse(
    text
  );
}

/*
|--------------------------------------------------------------------------
| RESUME QUALITY ANALYSIS
|--------------------------------------------------------------------------
|
| This generates:
|
| resumeScore
| resumeStrengths
| resumeGaps
|
| IMPORTANT:
| This is different from a job match score.
|--------------------------------------------------------------------------
*/

export async function analyzeResumeWithAI({
  name,
  skills,
  experienceYears,
  education,
  workHistory
}) {
  const prompt = `
You are an AI resume quality analysis system.

Analyze ONLY the candidate information provided below.

Never invent information.

Evaluate:

1. Skill relevance and clarity
2. Professional experience
3. Career history clarity
4. Education information
5. Completeness of professional information
6. Overall professional readiness

Do NOT evaluate:

- colors
- fonts
- resume design
- visual styling
- page count

Return ONLY valid JSON.

Do not use markdown.
Do not include explanations outside the JSON.

The JSON structure must be exactly:

{
  "resumeScore": 0,
  "resumeStrengths": [],
  "resumeGaps": []
}

Rules:

1. resumeScore must be an integer from 0 to 100.
2. resumeStrengths must contain concise strings.
3. resumeGaps must contain concise strings.
4. Use ONLY supplied candidate information.
5. Never fabricate skills.
6. Never fabricate experience.
7. Never fabricate education.
8. Never assume technologies that are not present.
9. Do not penalize the candidate for information that cannot be determined.
10. Return JSON only.

Candidate name:

${name || ""}

Skills:

${JSON.stringify(
  Array.isArray(skills)
    ? skills
    : []
)}

Experience years:

${Number.isFinite(
  Number(experienceYears)
)
  ? Number(experienceYears)
  : 0}

Education:

${JSON.stringify(
  Array.isArray(education)
    ? education
    : []
)}

Work history:

${JSON.stringify(
  Array.isArray(workHistory)
    ? workHistory
    : []
)}
`;

  const interaction =
    await ai.interactions.create({
      model: MODEL,
      input: prompt
    });

  const text =
    interaction.output_text;

  if (!text) {
    const error = new Error(
      "Gemini returned an empty resume analysis response"
    );

    error.statusCode = 502;
    error.errorCode =
      "EMPTY_RESUME_ANALYSIS_RESPONSE";

    throw error;
  }

  return parseResumeAnalysisResponse(
    text
  );
}

/*
|--------------------------------------------------------------------------
| RESUME ANALYSIS VALIDATION
|--------------------------------------------------------------------------
*/

function parseResumeAnalysisResponse(
  text
) {
  let cleanedText =
    String(text).trim();

  if (
    cleanedText.startsWith("```")
  ) {
    cleanedText =
      cleanedText
        .replace(
          /^```json\s*/i,
          ""
        )
        .replace(
          /^```\s*/i,
          ""
        )
        .replace(
          /\s*```$/i,
          ""
        )
        .trim();
  }

  let parsed;

  try {
    parsed =
      JSON.parse(cleanedText);
  } catch {
    const error = new Error(
      "Gemini returned invalid resume analysis JSON"
    );

    error.statusCode = 502;
    error.errorCode =
      "INVALID_RESUME_ANALYSIS_JSON";

    throw error;
  }

  if (
    !parsed ||
    typeof parsed !== "object"
  ) {
    throwInvalidResumeAnalysis();
  }

  if (
    !Number.isInteger(
      parsed.resumeScore
    ) ||
    parsed.resumeScore < 0 ||
    parsed.resumeScore > 100
  ) {
    throwInvalidResumeAnalysis();
  }

  if (
    !Array.isArray(
      parsed.resumeStrengths
    ) ||
    !Array.isArray(
      parsed.resumeGaps
    )
  ) {
    throwInvalidResumeAnalysis();
  }

  if (
    parsed.resumeStrengths.some(
      (item) =>
        typeof item !== "string"
    )
  ) {
    throwInvalidResumeAnalysis();
  }

  if (
    parsed.resumeGaps.some(
      (item) =>
        typeof item !== "string"
    )
  ) {
    throwInvalidResumeAnalysis();
  }

  return {
    resumeScore:
      parsed.resumeScore,

    resumeStrengths:
      parsed.resumeStrengths
        .filter(
          (item) =>
            item.trim()
        )
        .slice(0, 5),

    resumeGaps:
      parsed.resumeGaps
        .filter(
          (item) =>
            item.trim()
        )
        .slice(0, 5)
  };
}

function throwInvalidResumeAnalysis() {
  const error = new Error(
    "Gemini returned invalid resume analysis data"
  );

  error.statusCode = 502;
  error.errorCode =
    "INVALID_RESUME_ANALYSIS_SCHEMA";

  throw error;
}

/*
|--------------------------------------------------------------------------
| GENERIC RESUME RESPONSE VALIDATION
|--------------------------------------------------------------------------
*/

function parseAndValidateAIResponse(
  text
) {
  let cleanedText =
    String(text).trim();

  if (
    cleanedText.startsWith("```")
  ) {
    cleanedText =
      cleanedText
        .replace(
          /^```json\s*/i,
          ""
        )
        .replace(
          /^```\s*/i,
          ""
        )
        .replace(
          /\s*```$/i,
          ""
        )
        .trim();
  }

  let parsed;

  try {
    parsed =
      JSON.parse(cleanedText);
  } catch {
    const error = new Error(
      "Gemini returned invalid JSON"
    );

    error.statusCode = 502;
    error.errorCode =
      "INVALID_AI_RESPONSE";

    throw error;
  }

  validateResumeResponse(
    parsed
  );

  return parsed;
}

function validateResumeResponse(
  data
) {
  if (
    !data ||
    typeof data !== "object"
  ) {
    throwAIValidationError();
  }

  if (
    typeof data.name !== "string" ||
    !Array.isArray(data.skills) ||
    typeof data.experienceYears !==
      "number" ||
    !Number.isFinite(
      data.experienceYears
    ) ||
    !Array.isArray(data.education) ||
    !Array.isArray(data.workHistory)
  ) {
    throwAIValidationError();
  }

  if (
    data.experienceYears < 0
  ) {
    throwAIValidationError();
  }

  for (
    const skill of data.skills
  ) {
    if (
      typeof skill !== "string"
    ) {
      throwAIValidationError();
    }
  }

  for (
    const education of
      data.education
  ) {
    if (
      !education ||
      typeof education !==
        "object"
    ) {
      throwAIValidationError();
    }

    if (
      typeof education.institution !==
        "string" ||
      typeof education.degree !==
        "string" ||
      typeof education.field !==
        "string" ||
      typeof education.startYear !==
        "number" ||
      typeof education.endYear !==
        "number" ||
      typeof education.details !==
        "string"
    ) {
      throwAIValidationError();
    }
  }

  for (
    const work of
      data.workHistory
  ) {
    if (
      !work ||
      typeof work !== "object"
    ) {
      throwAIValidationError();
    }

    if (
      typeof work.company !==
        "string" ||
      typeof work.role !==
        "string" ||
      typeof work.startDate !==
        "string" ||
      typeof work.endDate !==
        "string" ||
      typeof work.description !==
        "string" ||
      !Array.isArray(work.skills)
    ) {
      throwAIValidationError();
    }

    for (
      const skill of work.skills
    ) {
      if (
        typeof skill !== "string"
      ) {
        throwAIValidationError();
      }
    }
  }
}

function throwAIValidationError() {
  const error = new Error(
    "Gemini returned data that does not match the required resume schema"
  );

  error.statusCode = 502;
  error.errorCode =
    "INVALID_AI_SCHEMA";

  throw error;
}

/*
|--------------------------------------------------------------------------
| JOB MATCHING
|--------------------------------------------------------------------------
*/

export async function matchResumeToJob({
  resume,
  job
}) {
  if (!resume || !job) {
    const error = new Error(
      "Resume and job data are required for AI matching"
    );

    error.statusCode = 400;
    error.errorCode =
      "MATCH_DATA_REQUIRED";

    throw error;
  }

  const experienceMin =
    job.experienceMin ??
    "not specified";

  const experienceMax =
    job.experienceMax ??
    "not specified";

  const prompt = `
You are an AI recruitment matching system.

Compare the candidate resume profile against the job requirements.

Use ONLY the information provided below.

Never invent information.

Evaluate:

1. Required skills
2. Relevant professional experience
3. Experience level
4. Role level

Return ONLY valid JSON.

Do not use markdown.
Do not include explanations outside the JSON.

The JSON structure must be exactly:

{
  "matchScore": 0,
  "reasoning": "",
  "strengths": [],
  "gaps": []
}

Rules:

1. matchScore must be an integer from 0 to 100.
2. Use only the candidate information provided.
3. Do not assume the candidate has skills that are not listed.
4. Do not fabricate professional experience.
5. Consider relevant skills more strongly than unrelated skills.
6. Consider professional experience against the job experience requirement.
7. Consider the requested role level.
8. strengths must contain skills or qualifications supported by the resume.
9. gaps must contain missing or insufficient requirements supported by the comparison.
10. reasoning must briefly explain the score.
11. Return JSON only.

JOB:

Title:
${job.title || ""}

Description:
${job.description || ""}

Required Skills:
${JSON.stringify(
  job.requiredSkills || []
)}

Minimum Experience:
${experienceMin}

Maximum Experience:
${experienceMax}

Role Level:
${job.roleLevel || ""}

Candidate Resume:

Name:
${resume.name || ""}

Skills:
${JSON.stringify(
  resume.skills || []
)}

Experience Years:
${resume.experienceYears ?? 0}

Education:
${JSON.stringify(
  resume.education || []
)}

Work History:
${JSON.stringify(
  resume.workHistory || []
)}
`;

  const interaction =
    await ai.interactions.create({
      model: MODEL,
      input: prompt
    });

  const text =
    interaction.output_text;

  if (!text) {
    const error = new Error(
      "Gemini returned an empty match response"
    );

    error.statusCode = 502;
    error.errorCode =
      "EMPTY_MATCH_AI_RESPONSE";

    throw error;
  }

  return parseAndValidateMatchResponse(
    text
  );
}

/*
|--------------------------------------------------------------------------
| MATCH RESPONSE VALIDATION
|--------------------------------------------------------------------------
*/

function parseAndValidateMatchResponse(
  text
) {
  let cleanedText =
    String(text).trim();

  if (
    cleanedText.startsWith("```")
  ) {
    cleanedText =
      cleanedText
        .replace(
          /^```json\s*/i,
          ""
        )
        .replace(
          /^```\s*/i,
          ""
        )
        .replace(
          /\s*```$/i,
          ""
        )
        .trim();
  }

  let parsed;

  try {
    parsed =
      JSON.parse(cleanedText);
  } catch {
    const error = new Error(
      "Gemini returned invalid match JSON"
    );

    error.statusCode = 502;
    error.errorCode =
      "INVALID_MATCH_AI_RESPONSE";

    throw error;
  }

  validateMatchResponse(
    parsed
  );

  return parsed;
}

function validateMatchResponse(
  data
) {
  if (
    !data ||
    typeof data !== "object"
  ) {
    throwMatchValidationError();
  }

  if (
    typeof data.matchScore !==
      "number" ||
    !Number.isInteger(
      data.matchScore
    ) ||
    data.matchScore < 0 ||
    data.matchScore > 100 ||
    typeof data.reasoning !==
      "string" ||
    !Array.isArray(
      data.strengths
    ) ||
    !Array.isArray(data.gaps)
  ) {
    throwMatchValidationError();
  }

  for (
    const strength of
      data.strengths
  ) {
    if (
      typeof strength !==
      "string"
    ) {
      throwMatchValidationError();
    }
  }

  for (
    const gap of data.gaps
  ) {
    if (
      typeof gap !== "string"
    ) {
      throwMatchValidationError();
    }
  }
}

function throwMatchValidationError() {
  const error = new Error(
    "Gemini returned data that does not match the required match schema"
  );

  error.statusCode = 502;
  error.errorCode =
    "INVALID_MATCH_AI_SCHEMA";

  throw error;
}

/*
|--------------------------------------------------------------------------
| INTERVIEW QUESTIONS
|--------------------------------------------------------------------------
*/

export async function generateInterviewQuestions({
  resume,
  job
}) {
  if (!resume || !job) {
    const error = new Error(
      "Resume and job data are required"
    );

    error.statusCode = 400;
    error.errorCode =
      "INTERVIEW_DATA_REQUIRED";

    throw error;
  }

  const experienceMin =
    job.experienceMin ??
    "not specified";

  const experienceMax =
    job.experienceMax ??
    "not specified";

  const prompt = `
You are an AI recruitment interview-question generator.

Generate exactly 5 job-specific interview questions based ONLY on the job and candidate information provided below.

Do not invent candidate experience or skills.

Questions should evaluate:

- required technical skills
- relevant experience
- role responsibilities
- candidate-specific gaps where appropriate

Return ONLY valid JSON.

Do not use markdown.
Do not include explanations.

The JSON structure must be exactly:

{
  "questions": [
    "",
    "",
    "",
    "",
    ""
  ]
}

Rules:

1. Return exactly 5 questions.
2. Every question must be a non-empty string.
3. Questions must be relevant to the specific job.
4. Use the candidate resume only as supporting context.
5. Do not claim the candidate has experience they do not have.
6. Do not fabricate information.
7. Return JSON only.

JOB:

Title:
${job.title || ""}

Description:
${job.description || ""}

Required Skills:
${JSON.stringify(
  job.requiredSkills || []
)}

Experience Minimum:
${experienceMin}

Experience Maximum:
${experienceMax}

Role Level:
${job.roleLevel || ""}

CANDIDATE:

Name:
${resume.name || ""}

Skills:
${JSON.stringify(
  resume.skills || []
)}

Experience Years:
${resume.experienceYears ?? 0}

Education:
${JSON.stringify(
  resume.education || []
)}

Work History:
${JSON.stringify(
  resume.workHistory || []
)}
`;

  const interaction =
    await ai.interactions.create({
      model: MODEL,
      input: prompt
    });

  const text =
    interaction.output_text;

  if (!text) {
    const error = new Error(
      "Gemini returned an empty interview-question response"
    );

    error.statusCode = 502;
    error.errorCode =
      "EMPTY_INTERVIEW_AI_RESPONSE";

    throw error;
  }

  return parseAndValidateInterviewQuestions(
    text
  );
}

/*
|--------------------------------------------------------------------------
| INTERVIEW QUESTION VALIDATION
|--------------------------------------------------------------------------
*/

function parseAndValidateInterviewQuestions(
  text
) {
  let cleanedText =
    String(text).trim();

  if (
    cleanedText.startsWith("```")
  ) {
    cleanedText =
      cleanedText
        .replace(
          /^```json\s*/i,
          ""
        )
        .replace(
          /^```\s*/i,
          ""
        )
        .replace(
          /\s*```$/i,
          ""
        )
        .trim();
  }

  let parsed;

  try {
    parsed =
      JSON.parse(cleanedText);
  } catch {
    const error = new Error(
      "Gemini returned invalid interview-question JSON"
    );

    error.statusCode = 502;
    error.errorCode =
      "INVALID_INTERVIEW_AI_RESPONSE";

    throw error;
  }

  if (
    !parsed ||
    !Array.isArray(
      parsed.questions
    ) ||
    parsed.questions.length !== 5
  ) {
    const error = new Error(
      "Gemini must return exactly 5 interview questions"
    );

    error.statusCode = 502;
    error.errorCode =
      "INVALID_INTERVIEW_AI_SCHEMA";

    throw error;
  }

  for (
    const question of
      parsed.questions
  ) {
    if (
      typeof question !==
        "string" ||
      !question.trim()
    ) {
      const error = new Error(
        "Invalid interview question returned by Gemini"
      );

      error.statusCode = 502;
      error.errorCode =
        "INVALID_INTERVIEW_QUESTION";

      throw error;
    }
  }

  return {
    questions:
      parsed.questions.map(
        (question) =>
          question.trim()
      )
  };
}

export async function generateJobMatch(
  candidateProfile,
  job
) {
  const prompt = `
You are an AI recruitment matching system.

Compare the candidate profile with the job.

You must evaluate:
- Candidate skills against job required skills
- Candidate experience years
- Job experience level
- Relevance of education
- Relevance of work history

Do not fabricate information.

Candidate Profile:
${JSON.stringify({
  name: candidateProfile.name,
  skills: candidateProfile.skills,
  experienceYears:
    candidateProfile.experienceYears,
  education: candidateProfile.education,
  workHistory: candidateProfile.workHistory
})}

Job:
${JSON.stringify({
  title: job.title,
  description: job.description,
  skills: job.skills,
  experienceLevel: job.experienceLevel,
  employmentType: job.employmentType,
  location: job.location
})}

Return ONLY valid JSON.

Use exactly this structure:

{
  "matchScore": 0,
  "reasoning": "",
  "strengths": [],
  "gaps": [],
  "interviewQuestions": []
}

Rules:

- matchScore must be an integer between 0 and 100
- reasoning must explain the score based only on provided data
- strengths must contain relevant matching qualifications
- gaps must contain missing or weak qualifications
- interviewQuestions must contain exactly 5 questions
- Questions must be specific to the job and candidate profile
- Never invent skills, experience, education, or achievements
- Return JSON only
`;

  const response =
    await generateGeminiResponse(prompt);

  const parsedResult =
    parseAIJson(response);

  validateJobMatchResult(parsedResult);

  return parsedResult;
}