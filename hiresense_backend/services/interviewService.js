import { pool } from "../config/mysql.js";
import ResumeProfile from "../models/mongo/resumeProfileModel.js";
import InterviewQuestion from "../models/mongo/interviewQuestionModel.js";
import {
  generateInterviewQuestions
} from "./aiService.js";

export async function getOrCreateInterviewQuestions({
  candidateId,
  jobId
}) {
  const existing =
    await InterviewQuestion.findOne({
      candidateId,
      jobId
    }).lean();

  if (existing) {
    return {
      questions: existing,
      cached: true
    };
  }

  const [jobs] = await pool.query(
    `
    SELECT
      id,
      title,
      description,
      required_skills,
      experience_min,
      experience_max,
      role_level,
      status
    FROM jobs
    WHERE id = ?
    LIMIT 1
    `,
    [jobId]
  );

  if (jobs.length === 0) {
    const error = new Error(
      "Job not found"
    );

    error.statusCode = 404;
    error.errorCode =
      "JOB_NOT_FOUND";

    throw error;
  }

  const job = jobs[0];

  if (job.status !== "open") {
    const error = new Error(
      "Job is not open"
    );

    error.statusCode = 400;
    error.errorCode =
      "JOB_NOT_OPEN";

    throw error;
  }

  const resume =
    await ResumeProfile.findOne({
      candidateId
    }).lean();

  if (!resume) {
    const error = new Error(
      "Resume profile not found"
    );

    error.statusCode = 404;
    error.errorCode =
      "RESUME_PROFILE_NOT_FOUND";

    throw error;
  }

  if (resume.aiStatus !== "completed") {
    const error = new Error(
      "Resume AI processing is not completed"
    );

    error.statusCode = 400;
    error.errorCode =
      "RESUME_AI_NOT_COMPLETED";

    throw error;
  }

  const jobData = {
    id: job.id,
    title: job.title,
    description: job.description,
    requiredSkills:
      parseJsonArray(
        job.required_skills
      ),
    experienceMin:
      Number(job.experience_min ?? 0),
    experienceMax:
      Number(job.experience_max ?? 0),
    roleLevel: job.role_level
  };

  const result =
    await generateInterviewQuestions({
      resume,
      job: jobData
    });

  let saved;

  try {
    saved =
      await InterviewQuestion.create({
        candidateId,
        jobId,
        questions: result.questions
      });
  } catch (error) {
    if (error.code === 11000) {
      saved =
        await InterviewQuestion.findOne({
          candidateId,
          jobId
        });
    } else {
      throw error;
    }
  }

  return {
    questions: saved.toObject
      ? saved.toObject()
      : saved,
    cached: false
  };
}

function parseJsonArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}