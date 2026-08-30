import MatchResult from "../models/mongo/matchResultModel.js";

import ResumeProfile from "../models/mongo/resumeProfileModel.js";

import {
  matchResumeToJob,
  generateInterviewQuestions
} from "./aiService.js";

import {
  findJobById
} from "../models/mysql/jobModel.js";

export async function generateOrGetJobMatch({
  candidateId,
  jobId
}) {
  const existingMatch =
    await MatchResult.findOne({
      candidateId,
      jobId
    });

  if (existingMatch) {
    return existingMatch;
  }

  const resume =
    await ResumeProfile.findOne({
      candidateId
    });

  if (!resume) {
    const error = new Error(
      "Resume profile not found. Upload a resume before matching jobs."
    );

    error.statusCode = 404;
    error.errorCode =
      "RESUME_PROFILE_NOT_FOUND";

    throw error;
  }

  const job =
    await findJobById(jobId);

  if (!job) {
    const error = new Error(
      "Job not found"
    );

    error.statusCode = 404;
    error.errorCode =
      "JOB_NOT_FOUND";

    throw error;
  }

  const match =
    await matchResumeToJob({
      resume,
      job
    });

  let interviewQuestions = [];

  try {
    const questionResult =
      await generateInterviewQuestions({
        resume,
        job
      });

    if (
      Array.isArray(
        questionResult?.questions
      )
    ) {
      interviewQuestions =
        questionResult.questions;
    }
  } catch {
    interviewQuestions = [];
  }

  const result =
    await MatchResult.findOneAndUpdate(
      {
        candidateId,
        jobId
      },
      {
        candidateId,
        jobId,
        matchScore: match.matchScore,
        reasoning: match.reasoning,
        strengths:
          Array.isArray(match.strengths)
            ? match.strengths
            : [],
        gaps:
          Array.isArray(match.gaps)
            ? match.gaps
            : [],
        interviewQuestions
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

  return result;
}

export async function getJobMatch({
  candidateId,
  jobId
}) {
  return MatchResult.findOne({
    candidateId,
    jobId
  });
}

export async function generateInterviewQuestionsForJob({
  candidateId,
  jobId
}) {
  const existingMatch =
    await MatchResult.findOne({
      candidateId,
      jobId
    });

  if (
    existingMatch &&
    Array.isArray(
      existingMatch.interviewQuestions
    ) &&
    existingMatch.interviewQuestions.length === 5
  ) {
    return existingMatch;
  }

  const resume =
    await ResumeProfile.findOne({
      candidateId
    });

  if (!resume) {
    const error = new Error(
      "Resume profile not found"
    );

    error.statusCode = 404;
    error.errorCode =
      "RESUME_PROFILE_NOT_FOUND";

    throw error;
  }

  const job =
    await findJobById(jobId);

  if (!job) {
    const error = new Error(
      "Job not found"
    );

    error.statusCode = 404;
    error.errorCode =
      "JOB_NOT_FOUND";

    throw error;
  }

  const questionResult =
    await generateInterviewQuestions({
      resume,
      job
    });

  const questions =
    Array.isArray(
      questionResult?.questions
    )
      ? questionResult.questions
      : [];

  if (existingMatch) {
    existingMatch.interviewQuestions =
      questions;

    await existingMatch.save();

    return existingMatch;
  }

  return generateOrGetJobMatch({
    candidateId,
    jobId
  });
}

export default {
  generateOrGetJobMatch,
  getJobMatch,
  generateInterviewQuestionsForJob
};