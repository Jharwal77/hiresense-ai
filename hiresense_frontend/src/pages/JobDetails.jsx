import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AIProcessingState from '../components/ai/AIProcessingState';
import MatchScoreCard from '../components/ai/MatchScoreCard';
import { useAuth } from '../context/useAuth';
import {
  getCandidateApplications,
  getInterviewQuestions,
  getJobMatch
} from '../services/candidateAiApi';
import { getCandidateProfile } from '../services/candidateResumeApi';
import { applyToJob, getJobById } from '../services/jobApi';

const formatSalary = (salaryMin, salaryMax) => {
  const minValue = Number(salaryMin);
  const maxValue = Number(salaryMax);

  const hasMin = Number.isFinite(minValue) && minValue > 0;
  const hasMax = Number.isFinite(maxValue) && maxValue > 0;

  if (!hasMin && !hasMax) return 'Salary not specified';

  const toLpa = (value) => {
    if (!Number.isFinite(value) || value <= 0) return null;

    const lakh = value / 100000;

    return Number.isInteger(lakh)
      ? lakh
      : Number(lakh.toFixed(1));
  };

  const minDisplay = toLpa(minValue);
  const maxDisplay = toLpa(maxValue);

  if (hasMin && hasMax) {
    return `₹${minDisplay} LPA – ₹${maxDisplay} LPA`;
  }

  if (hasMin) {
    return `₹${minDisplay} LPA+`;
  }

  return `Up to ₹${maxDisplay} LPA`;
};

const normalizeEmploymentType = (value) => {
  if (
    !value ||
    String(value).trim().toLowerCase() === 'not specified'
  ) {
    return 'Job type not specified';
  }

  const raw = String(value)
    .trim()
    .toLowerCase()
    .replace(/_/g, '-');

  const map = {
    'full-time': 'Full-time',
    'full time': 'Full-time',
    'part-time': 'Part-time',
    'part time': 'Part-time',
    contract: 'Contract',
    internship: 'Internship',
    freelance: 'Freelance',
    temporary: 'Temporary'
  };

  return map[raw] || String(value).trim();
};

const formatExperience = (experienceMin, experienceMax) => {
  const minValue = Number(experienceMin);
  const maxValue = Number(experienceMax);

  const hasMin = Number.isFinite(minValue) && minValue > 0;
  const hasMax = Number.isFinite(maxValue) && maxValue > 0;

  if (!hasMin && !hasMax) return 'Not specified';

  if (hasMin && hasMax) {
    if (minValue === 1 && maxValue === 3) {
      return '1–3 years';
    }

    if (minValue === 3 && maxValue === 5) {
      return '3–5 years';
    }

    if (minValue > maxValue) {
      return `${minValue}+ years`;
    }

    return `${minValue}–${maxValue} years`;
  }

  if (hasMin) {
    if (minValue >= 5) {
      return '5+ years';
    }

    return `${minValue}+ years`;
  }

  if (hasMax) {
    return `${maxValue} years`;
  }

  return 'Not specified';
};

const normalizeRoleLevel = (value) => {
  if (
    !value ||
    String(value).trim().toLowerCase() === 'not specified'
  ) {
    return 'Not specified';
  }

  const raw = String(value)
    .trim()
    .toLowerCase()
    .replace(/_/g, '-');

  const map = {
    'entry-level': 'Entry Level',
    'entry level': 'Entry Level',
    internship: 'Internship',
    junior: 'Junior',
    'mid-level': 'Mid Level',
    'mid level': 'Mid Level',
    senior: 'Senior',
    lead: 'Lead',
    manager: 'Manager'
  };

  return map[raw] || String(value).trim();
};

const getCompanyName = (job) => {
  const value =
    job?.company ||
    job?.companyName ||
    job?.employerName;

  if (
    value &&
    String(value).trim() !== 'undefined' &&
    String(value).trim() !== 'null'
  ) {
    return value;
  }

  return job?.isExternal
    ? 'Adzuna Job'
    : 'HireSense Job';
};

const getSourceLabel = (job) => {
  if (job?.source) {
    const value = String(job.source)
      .trim()
      .toLowerCase();

    if (value === 'adzuna') return 'Adzuna';
    if (value === 'hiresense') return 'HireSense';
  }

  return job?.isExternal
    ? 'Adzuna'
    : 'HireSense';
};

export default function JobDetailsPage({ isDark }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [hasApplied, setHasApplied] = useState(false);

  const [match, setMatch] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [resumeAvailable, setResumeAvailable] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    const controller = {
      cancelled: false
    };

    const loadJob = async () => {
      try {
        const found = await getJobById(id);

        if (!controller.cancelled) {
          setJob(found || null);
        }
      } catch {
        if (!controller.cancelled) {
          setJob(null);
        }
      } finally {
        if (!controller.cancelled) {
          setLoading(false);
        }
      }
    };

    loadJob();

    return () => {
      controller.cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let active = true;

    const loadApplicationState = async () => {
      if (
        !job?.id ||
        !user ||
        user.role !== 'candidate'
      ) {
        if (active) {
          setHasApplied(false);
        }

        return;
      }

      try {
        const applications =
          await getCandidateApplications().catch(() => []);

        if (!active) return;

        const alreadyApplied =
          Array.isArray(applications)
            ? applications.some(
                (application) =>
                  Number(
                    application?.jobId ??
                    application?.job_id ??
                    application?.job?.id
                  ) === Number(job.id)
              )
            : false;

        setHasApplied(alreadyApplied);
      } catch {
        if (active) {
          setHasApplied(false);
        }
      }
    };

    loadApplicationState();

    return () => {
      active = false;
    };
  }, [job?.id, user]);

  useEffect(() => {
    let active = true;

    const loadAiInsights = async () => {
      if (
        !job?.id ||
        !user ||
        user.role !== 'candidate'
      ) {
        if (active) {
          setMatch(null);
          setQuestions([]);
          setAiLoading(false);
          setResumeAvailable(false);
          setAiError('');
        }

        return;
      }

      try {
        const profile =
          await getCandidateProfile().catch(() => null);

        if (!active) return;

        setResumeAvailable(Boolean(profile));

        if (!profile) {
          setMatch(null);
          setQuestions([]);
          return;
        }

        setAiLoading(true);
        setAiError('');

        const [nextMatch, nextQuestions] =
          await Promise.all([
            getJobMatch(job.id).catch(() => null),
            getInterviewQuestions(job.id).catch(() => [])
          ]);

        if (!active) return;

        setMatch(nextMatch);
        setQuestions(
          Array.isArray(nextQuestions)
            ? nextQuestions
            : []
        );
      } catch (error) {
        if (active) {
          setAiError(
            error?.response?.data?.message ||
              'AI matching is not available right now.'
          );
        }
      } finally {
        if (active) {
          setAiLoading(false);
        }
      }
    };

    loadAiInsights();

    return () => {
      active = false;
    };
  }, [job?.id, user]);

  const handleApply = async () => {
    if (!job || hasApplied) return;

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'employer') {
      setApplyMessage(
        'Only candidates can apply to jobs.'
      );
      return;
    }

    if (job.isExternal) {
      window.open(
        job.externalUrl,
        '_blank',
        'noopener,noreferrer'
      );

      setApplyMessage(
        'Opening the job listing in a new tab.'
      );

      return;
    }

    try {
      setApplying(true);
      setApplyMessage('');

      await applyToJob(job.id);

      const applications =
        await getCandidateApplications().catch(
          () => []
        );

      const alreadyApplied =
        Array.isArray(applications)
          ? applications.some(
              (application) =>
                Number(
                  application?.jobId ??
                  application?.job_id ??
                  application?.job?.id
                ) === Number(job.id)
            )
          : false;

      setHasApplied(alreadyApplied);

      setApplyMessage(
        'Application submitted successfully.'
      );
    } catch (error) {
      if (error.response?.status === 409) {
        setHasApplied(true);

        setApplyMessage(
          'You have already applied to this job.'
        );
      } else {
        setApplyMessage(
          error.response?.data?.message ||
            'Failed to apply for this job.'
        );
      }
    } finally {
      setApplying(false);
    }
  };

  const cardClass = isDark
    ? 'border-slate-700 bg-slate-950'
    : 'border-slate-200 bg-white';

  const sidebarClass = isDark
    ? 'border-slate-700 bg-slate-900'
    : 'border-slate-200 bg-slate-50';

  const titleClass = isDark
    ? 'text-white'
    : 'text-slate-900';

  const textClass = isDark
    ? 'text-slate-300'
    : 'text-slate-600';

  const mutedClass = isDark
    ? 'text-slate-400'
    : 'text-slate-500';

  const chipClass = isDark
    ? 'bg-slate-800 text-slate-200'
    : 'bg-slate-100 text-slate-600';

  const buttonClass = isDark
    ? 'bg-white text-slate-900 hover:bg-slate-200'
    : 'bg-slate-900 text-white hover:bg-slate-800';

  const backClass = isDark
    ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300';

  if (loading) {
    return (
      <div
        className={
          isDark
            ? 'rounded-2xl border border-slate-700 bg-slate-900 p-8 text-slate-300'
            : 'rounded-2xl border border-slate-200 bg-white p-8 text-slate-600'
        }
      >
        Loading role details...
      </div>
    );
  }

  if (!job) {
    return (
      <div
        className={
          isDark
            ? 'rounded-2xl border border-slate-700 bg-slate-900 p-8 text-slate-300'
            : 'rounded-2xl border border-slate-200 bg-white p-8 text-slate-600'
        }
      >
        Job not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/jobs"
        className={`inline-flex rounded-lg border px-3 py-2 text-sm ${backClass}`}
      >
        ← Back to jobs
      </Link>

      <div
        className={`rounded-3xl border p-8 shadow-sm ${cardClass}`}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p
              className={
                isDark
                  ? 'text-sm uppercase tracking-[0.2em] text-sky-300'
                  : 'text-sm uppercase tracking-[0.2em] text-sky-700'
              }
            >
              {getSourceLabel(job)}
            </p>

            <h2
              className={`mt-2 text-4xl font-bold ${titleClass}`}
            >
              {job.title || 'Untitled job'}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleApply}
            disabled={applying || hasApplied}
            className={`rounded-xl px-5 py-3 text-sm font-semibold ${buttonClass} disabled:cursor-not-allowed disabled:opacity-70`}
          >
            {job.isExternal
              ? 'Apply on Adzuna'
              : hasApplied
                ? 'Applied'
                : applying
                  ? 'Applying...'
                  : 'Apply Now'}
          </button>
        </div>

        {applyMessage ? (
          <p
            className={
              isDark
                ? 'mt-4 text-sm text-slate-200'
                : 'mt-4 text-sm text-slate-700'
            }
          >
            {applyMessage}
          </p>
        ) : null}

        {user?.role === 'candidate' ? (
          <div className="mt-8 space-y-6">
            <div
              className={`rounded-3xl border p-6 ${cardClass}`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <h3
                  className={`text-xl font-semibold ${titleClass}`}
                >
                  AI Match
                </h3>

                {match ? (
                  <MatchScoreCard
                    isDark={isDark}
                    score={
                      match.matchScore ??
                      match.score ??
                      null
                    }
                  />
                ) : null}
              </div>

              {aiLoading ? (
                <div className="mt-4">
                  <AIProcessingState
                    isDark={isDark}
                    label="Analyzing your profile"
                  />
                </div>
              ) : !resumeAvailable ? (
                <p
                  className={`mt-4 text-sm ${textClass}`}
                >
                  Upload your resume to unlock AI-powered
                  job matching.
                </p>
              ) : aiError ? (
                <p
                  className={`mt-4 text-sm ${textClass}`}
                >
                  {aiError}
                </p>
              ) : match ? (
                <>
                  <p
                    className={`mt-4 text-sm ${textClass}`}
                  >
                    {match.reasoning ||
                      'No reasoning available from the backend yet.'}
                  </p>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div
                      className={`rounded-2xl border p-4 ${sidebarClass}`}
                    >
                      <p
                        className={`mb-2 text-sm font-semibold ${titleClass}`}
                      >
                        Strengths
                      </p>

                      {Array.isArray(match.strengths) &&
                      match.strengths.length ? (
                        <ul className="space-y-2 text-sm text-sky-400">
                          {match.strengths.map(
                            (item) => (
                              <li key={item}>
                                ✓ {item}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className={textClass}>
                          No strength data available from
                          the backend.
                        </p>
                      )}
                    </div>

                    <div
                      className={`rounded-2xl border p-4 ${sidebarClass}`}
                    >
                      <p
                        className={`mb-2 text-sm font-semibold ${titleClass}`}
                      >
                        Skill gaps
                      </p>

                      {Array.isArray(match.gaps) &&
                      match.gaps.length ? (
                        <ul className="space-y-2 text-sm text-amber-400">
                          {match.gaps.map(
                            (item) => (
                              <li key={item}>
                                • {item}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className={textClass}>
                          No skill gap data available from
                          the backend.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <p
                  className={`mt-4 text-sm ${textClass}`}
                >
                  AI matching is not available for this job
                  yet.
                </p>
              )}
            </div>

            <div
              className={`rounded-3xl border p-6 ${cardClass}`}
            >
              <h3
                className={`text-xl font-semibold ${titleClass}`}
              >
                AI Interview Preparation
              </h3>

              {questions.length ? (
                <ol className="mt-4 space-y-4">
                  {questions.map(
                    (question, index) => (
                      <li
                        key={`${question}-${index}`}
                        className={`rounded-2xl border p-4 ${sidebarClass}`}
                      >
                        <p
                          className={`text-xs uppercase tracking-[0.2em] ${mutedClass}`}
                        >
                          Question{' '}
                          {String(index + 1).padStart(
                            2,
                            '0'
                          )}
                        </p>

                        <p
                          className={`mt-2 text-sm ${textClass}`}
                        >
                          {question}
                        </p>
                      </li>
                    )
                  )}
                </ol>
              ) : (
                <p
                  className={`mt-4 text-sm ${textClass}`}
                >
                  Interview questions will appear after AI
                  analysis is available.
                </p>
              )}
            </div>
          </div>
        ) : null}

        <div
          className={`mt-6 flex flex-wrap gap-2 text-sm ${textClass}`}
        >
          <span
            className={`rounded-full px-3 py-1.5 ${chipClass}`}
          >
            {job.location || 'Remote'}
          </span>

          <span
            className={`rounded-full px-3 py-1.5 ${chipClass}`}
          >
            {normalizeEmploymentType(
              job.employmentType
            )}
          </span>

          <span
            className={`rounded-full px-3 py-1.5 ${chipClass}`}
          >
            {formatExperience(
              job.experienceMin,
              job.experienceMax
            )}
          </span>

          <span
            className={`rounded-full px-3 py-1.5 ${chipClass}`}
          >
            {formatSalary(
              job.salaryMin,
              job.salaryMax
            )}
          </span>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
          <div>
            <h3
              className={`text-xl font-semibold ${titleClass}`}
            >
              Role summary
            </h3>

            <p className={`mt-3 ${textClass}`}>
              {job.description ||
                'No description provided.'}
            </p>

            <div className="mt-8">
              <h3
                className={`text-xl font-semibold ${titleClass}`}
              >
                Required skills
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {(job.requiredSkills || []).map(
                  (skill) => (
                    <span
                      key={skill}
                      className={
                        isDark
                          ? 'rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-200'
                          : 'rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700'
                      }
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          <aside
            className={`rounded-2xl border p-6 ${sidebarClass}`}
          >
            <h3
              className={`text-lg font-semibold ${titleClass}`}
            >
              Quick facts
            </h3>

            <ul
              className={`mt-4 space-y-4 text-sm ${textClass}`}
            >
              <li
                className={
                  isDark
                    ? 'flex items-center justify-between border-b border-slate-700 pb-2'
                    : 'flex items-center justify-between border-b border-slate-200 pb-2'
                }
              >
                <span>Company</span>
                <span>{getCompanyName(job)}</span>
              </li>

              <li
                className={
                  isDark
                    ? 'flex items-center justify-between border-b border-slate-700 pb-2'
                    : 'flex items-center justify-between border-b border-slate-200 pb-2'
                }
              >
                <span>Source</span>
                <span>{getSourceLabel(job)}</span>
              </li>

              <li
                className={
                  isDark
                    ? 'flex items-center justify-between border-b border-slate-700 pb-2'
                    : 'flex items-center justify-between border-b border-slate-200 pb-2'
                }
              >
                <span>Role level</span>
                <span>
                  {normalizeRoleLevel(job.roleLevel)}
                </span>
              </li>

              <li
                className={
                  isDark
                    ? 'flex items-center justify-between border-b border-slate-700 pb-2'
                    : 'flex items-center justify-between border-b border-slate-200 pb-2'
                }
              >
                <span>Experience</span>
                <span>
                  {formatExperience(
                    job.experienceMin,
                    job.experienceMax
                  )}
                </span>
              </li>

              <li
                className={
                  isDark
                    ? 'flex items-center justify-between border-b border-slate-700 pb-2'
                    : 'flex items-center justify-between border-b border-slate-200 pb-2'
                }
              >
                <span>Type</span>
                <span>
                  {normalizeEmploymentType(
                    job.employmentType
                  )}
                </span>
              </li>

              <li className="flex items-center justify-between">
                <span>Salary</span>
                <span>
                  {formatSalary(
                    job.salaryMin,
                    job.salaryMax
                  )}
                </span>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}