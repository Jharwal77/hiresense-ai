import { pool } from "../config/mysql.js";
import ResumeProfile from "../models/mongo/resumeProfileModel.js";
import MatchResult from "../models/mongo/matchResultModel.js";
import InterviewQuestion from "../models/mongo/interviewQuestionModel.js";

export async function getEmployerCandidateDetails({
  candidateId,
  employerId
}) {
  const [applications] =
    await pool.query(
      `
      SELECT
        a.id,
        a.job_id,
        a.candidate_id,
        a.status,
        a.created_at,
        a.updated_at,

        u.name AS candidate_name,
        u.email AS candidate_email,

        j.title AS job_title,
        j.description AS job_description,
        j.required_skills,
        j.experience_min,
        j.experience_max,
        j.role_level,
        j.location,
        j.employment_type,
        j.status AS job_status,

        c.id AS company_id,
        c.name AS company_name

      FROM applications a

      INNER JOIN users u
        ON u.id = a.candidate_id

      INNER JOIN jobs j
        ON j.id = a.job_id

      INNER JOIN companies c
        ON c.id = j.company_id

      WHERE a.candidate_id = ?
        AND j.employer_id = ?

      ORDER BY a.created_at DESC
      `,
      [
        candidateId,
        employerId
      ]
    );

  if (applications.length === 0) {
    const error = new Error(
      "Candidate not found or you do not have permission to view this candidate"
    );

    error.statusCode = 404;
    error.errorCode =
      "CANDIDATE_NOT_FOUND";

    throw error;
  }

  const candidate =
    applications[0];

  const resume =
    await ResumeProfile.findOne({
      candidateId
    }).lean();

  const matchResults =
    await MatchResult.find({
      candidateId
    }).lean();

  const interviewQuestions =
    await InterviewQuestion.find({
      candidateId
    }).lean();

  const matchesByJob =
    new Map(
      matchResults.map(
        (match) => [
          Number(match.jobId),
          match
        ]
      )
    );

  const questionsByJob =
    new Map(
      interviewQuestions.map(
        (questions) => [
          Number(questions.jobId),
          questions
        ]
      )
    );

  return {
    candidate: {
      id:
        candidate.candidate_id,

      name:
        candidate.candidate_name,

      email:
        candidate.candidate_email,

      resume: resume
        ? {
            id: resume._id,
            name: resume.name,
            skills: resume.skills,
            experienceYears:
              resume.experienceYears,
            education:
              resume.education,
            workHistory:
              resume.workHistory,
            aiStatus:
              resume.aiStatus,
            aiError:
              resume.aiError,
            sourceDocument:
              resume.sourceDocument
          }
        : null
    },

    applications:
      applications.map(
        (application) => {
          const match =
            matchesByJob.get(
              Number(
                application.job_id
              )
            );

          const questions =
            questionsByJob.get(
              Number(
                application.job_id
              )
            );

          return {
            id:
              application.id,

            status:
              application.status,

            createdAt:
              application.created_at,

            updatedAt:
              application.updated_at,

            job: {
              id:
                application.job_id,

              title:
                application.job_title,

              description:
                application.job_description,

              requiredSkills:
                parseJsonArray(
                  application.required_skills
                ),

              experienceMin:
                Number(
                  application.experience_min
                ),

              experienceMax:
                Number(
                  application.experience_max
                ),

              roleLevel:
                application.role_level,

              location:
                application.location,

              employmentType:
                application.employment_type,

              status:
                application.job_status
            },

            match: match
              ? {
                  id: match._id,
                  matchScore:
                    match.matchScore,
                  reasoning:
                    match.reasoning,
                  strengths:
                    match.strengths,
                  gaps:
                    match.gaps
                }
              : null,

            interviewQuestions:
              questions
                ? questions.questions
                : []
          };
        }
      )
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