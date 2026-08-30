import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmployerNav from '../components/employer/EmployerNav';
import {
  getEmployerJobById,
  getJobApplications,
  updateApplicationStatus
} from '../services/employerApi';

const getFriendlyErrorMessage = (error) => {
  const status = error?.response?.status;
  const message =
    error?.response?.data?.message || error?.message;

  if (status === 401 || status === 403) {
    return 'Your session has expired. Please log in again.';
  }

  if (status === 404) {
    return 'This job or application could not be found.';
  }

  if (status === 409) {
    return 'This status change conflicts with the current application state.';
  }

  if (status === 422) {
    return 'Please choose a valid application status and try again.';
  }

  if (status === 500) {
    return 'We could not update the application status right now. Please try again.';
  }

  if (message) {
    return message;
  }

  return 'Unable to load applications right now. Please try again.';
};

const getStatusClasses = (status, isDark) => {
  const normalized = String(status || '').toLowerCase();

  if (normalized === 'shortlisted') {
    return isDark
      ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
      : 'border-amber-200 bg-amber-50 text-amber-700';
  }

  if (normalized === 'rejected') {
    return isDark
      ? 'border-red-500/40 bg-red-500/10 text-red-200'
      : 'border-red-200 bg-red-50 text-red-700';
  }

  if (normalized === 'hired') {
    return isDark
      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  return isDark
    ? 'border-sky-500/40 bg-sky-500/10 text-sky-200'
    : 'border-sky-200 bg-sky-50 text-sky-700';
};

const formatDate = (value) => {
  if (!value) {
    return 'Not available yet';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available yet';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const getCandidateName = (application) => {
  const candidate = application?.candidate;

  return (
    candidate?.name ||
    candidate?.email ||
    `Candidate ${application?.candidateId ?? ''}` ||
    'Candidate'
  );
};

const getMatchScoreLabel = (application) => {
  const score =
    application?.match?.matchScore ??
    application?.ranking?.matchScore ??
    application?.matchScore;

  if (Number.isFinite(Number(score))) {
    return `${Number(score)}%`;
  }

  return 'Not available yet';
};

const getFinalScoreLabel = (application) => {
  const score =
    application?.ranking?.finalScore ??
    application?.finalScore ??
    application?.match?.finalScore;

  if (Number.isFinite(Number(score))) {
    return `${Number(score)}%`;
  }

  return 'Not available yet';
};

const getActionOptions = (status) => {
  const normalizedStatus = String(status || '').toLowerCase();

  if (normalizedStatus === 'applied') {
    return [
      {
        label: 'Shortlist',
        value: 'shortlisted'
      },
      {
        label: 'Reject',
        value: 'rejected'
      }
    ];
  }

  if (normalizedStatus === 'shortlisted') {
    return [
      {
        label: 'Reject',
        value: 'rejected'
      },
      {
        label: 'Hire',
        value: 'hired'
      }
    ];
  }

  return [];
};

export default function EmployerJobApplicationsPage({
  isDark
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  /*
   * Toast auto-dismiss.
   */
  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setToast('');
    }, 2600);

    return () => {
      clearTimeout(timeout);
    };
  }, [toast]);

  /*
   * Load the job and its applications.
   *
   * The request itself lives inside the effect so the effect
   * does not depend on a recreated function.
   */
  useEffect(() => {
    let cancelled = false;

    const loadPageData = async () => {
      setLoading(true);
      setError('');

      try {
        const [jobData, response] = await Promise.all([
          getEmployerJobById(id),
          getJobApplications(id)
        ]);

        if (cancelled) {
          return;
        }

        setJob(
          jobData ||
            response?.job ||
            null
        );

        setApplications(
          Array.isArray(response?.applications)
            ? response.applications
            : []
        );
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          getFriendlyErrorMessage(requestError)
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPageData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /*
   * Manual retry.
   *
   * This function intentionally performs the same API operation
   * from a user action rather than from an effect.
   */
  const handleRetry = async () => {
    setLoading(true);
    setError('');

    try {
      const [jobData, response] = await Promise.all([
        getEmployerJobById(id),
        getJobApplications(id)
      ]);

      setJob(
        jobData ||
          response?.job ||
          null
      );

      setApplications(
        Array.isArray(response?.applications)
          ? response.applications
          : []
      );
    } catch (requestError) {
      setError(
        getFriendlyErrorMessage(requestError)
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Update candidate application status.
   */
  const handleStatusUpdate = async () => {
    if (!confirmAction) {
      return;
    }

    const {
      applicationId,
      status,
      label
    } = confirmAction;

    setUpdatingId(applicationId);
    setConfirmAction(null);
    setError('');

    try {
      const response =
        await updateApplicationStatus(
          applicationId,
          status
        );

      const updatedApplication =
        response?.application ||
        response;

      setApplications((current) =>
        current.map((application) => {
          if (
            Number(application.id) !==
            Number(applicationId)
          ) {
            return application;
          }

          return {
            ...application,
            ...updatedApplication,
            status:
              updatedApplication?.status ||
              status,
            updatedAt:
              updatedApplication?.updated_at ||
              updatedApplication?.updatedAt ||
              application.updatedAt
          };
        })
      );

      if (label === 'Hire') {
        setToast(
          'Candidate marked as hired.'
        );
      } else if (label === 'Shortlist') {
        setToast(
          'Candidate shortlisted successfully.'
        );
      } else {
        setToast(
          'Application rejected.'
        );
      }
    } catch (requestError) {
      setError(
        getFriendlyErrorMessage(
          requestError
        )
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
   * Backend ranking is already calculated.
   *
   * The frontend only sorts using the final score returned
   * by the backend.
   */
  const rankedApplications = useMemo(() => {
    const nextApplications = [
      ...applications
    ];

    return nextApplications.sort(
      (a, b) => {
        const scoreA = Number(
          a?.ranking?.finalScore ??
          a?.finalScore ??
          0
        );

        const scoreB = Number(
          b?.ranking?.finalScore ??
          b?.finalScore ??
          0
        );

        if (
          Number.isFinite(scoreA) &&
          Number.isFinite(scoreB) &&
          scoreB !== scoreA
        ) {
          return scoreB - scoreA;
        }

        return 0;
      }
    );
  }, [applications]);

  /*
   * Highest ranked candidate.
   */
  const topMatch = useMemo(() => {
    return (
      rankedApplications.find(
        (application) =>
          Number.isFinite(
            Number(
              application?.ranking?.finalScore ??
              application?.finalScore
            )
          )
      ) || null
    );
  }, [rankedApplications]);

  /*
   * Number of applications with AI interview questions.
   */
  const screeningReady = useMemo(() => {
    return applications.filter(
      (application) => {
        const questions =
          application?.match
            ?.interviewQuestions ||
          application?.interviewQuestions ||
          [];

        return (
          Array.isArray(questions) &&
          questions.length > 0
        );
      }
    ).length;
  }, [applications]);

  /*
   * Search candidates.
   */
  const filteredApplications = useMemo(() => {
    const normalized =
      searchTerm
        .trim()
        .toLowerCase();

    if (!normalized) {
      return rankedApplications;
    }

    return rankedApplications.filter(
      (application) => {
        const values = [
          getCandidateName(application),
          application?.candidate?.email,
          application?.job?.title,
          application?.match?.strengths?.join(
            ' '
          ),
          application?.match?.gaps?.join(
            ' '
          ),
          application?.status
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return values.includes(
          normalized
        );
      }
    );
  }, [
    rankedApplications,
    searchTerm
  ]);

  /*
   * Header statistics.
   */
  const headerStats = useMemo(() => {
    const appCount =
      applications.length;

    const shortlistCount =
      applications.filter(
        (application) =>
          String(
            application.status
          ).toLowerCase() ===
          'shortlisted'
      ).length;

    const rejectedCount =
      applications.filter(
        (application) =>
          String(
            application.status
          ).toLowerCase() ===
          'rejected'
      ).length;

    return [
      {
        label: 'Applications',
        value: appCount
      },
      {
        label: 'Shortlisted',
        value: shortlistCount
      },
      {
        label: 'Rejected',
        value: rejectedCount
      },
      {
        label: 'Top Match',
        value: topMatch
          ? getFinalScoreLabel(
              topMatch
            )
          : 'Not available yet'
      },
      {
        label: 'AI Screening',
        value: screeningReady
      },
      {
        label: 'Search Results',
        value:
          filteredApplications.length
      }
    ];
  }, [
    applications,
    filteredApplications.length,
    screeningReady,
    topMatch
  ]);

  /*
   * Theme classes.
   */
  const panel = isDark
    ? 'border-slate-700 bg-slate-900'
    : 'border-slate-200 bg-white';

  const mutedPanel = isDark
    ? 'border-slate-700 bg-slate-950'
    : 'border-slate-200 bg-slate-50';

  const text = isDark
    ? 'text-slate-300'
    : 'text-slate-600';

  const heading = isDark
    ? 'text-white'
    : 'text-slate-900';

  const secondaryButton = isDark
    ? 'border border-slate-700 bg-slate-950 text-slate-100 hover:border-slate-500'
    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300';

  const primaryButton = isDark
    ? 'bg-white text-slate-900 hover:bg-slate-200'
    : 'bg-slate-900 text-white hover:bg-slate-800';

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p
            className={
              isDark
                ? 'text-sm uppercase tracking-[0.2em] text-sky-300'
                : 'text-sm uppercase tracking-[0.2em] text-sky-700'
            }
          >
            Applications
          </p>

          <h2
            className={`mt-2 text-3xl font-bold ${heading}`}
          >
            {job?.title ||
              'Job applications'}
          </h2>
        </div>

        <Link
          to="/employer/jobs"
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${secondaryButton}`}
        >
          Back to jobs
        </Link>
      </div>

      <EmployerNav
        isDark={isDark}
      />

      {/* Success toast */}
      {toast ? (
        <div
          className={`rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm ${
            isDark
              ? 'text-emerald-200'
              : 'text-emerald-700'
          }`}
        >
          {toast}
        </div>
      ) : null}

      {/* Error */}
      {error ? (
        <div
          className={`rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm ${
            isDark
              ? 'text-red-200'
              : 'text-red-700'
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>

            <button
              type="button"
              onClick={handleRetry}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${primaryButton}`}
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {headerStats.map(
          (item) => (
            <div
              key={item.label}
              className={`rounded-2xl border p-5 ${panel}`}
            >
              <div
                className={`text-sm ${text}`}
              >
                {item.label}
              </div>

              <div
                className={`mt-3 text-3xl font-bold ${heading}`}
              >
                {item.value}
              </div>
            </div>
          )
        )}
      </div>

      {/* Ranking methodology */}
      <div
        className={`rounded-3xl border p-5 ${panel}`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p
              className={`text-sm ${text}`}
            >
              Ranking methodology
            </p>

            <h3
              className={`mt-1 text-2xl font-bold ${heading}`}
            >
              Backend-ranked shortlist
            </h3>
          </div>

          {topMatch ? (
            <div
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                isDark
                  ? 'border-sky-500/30 bg-sky-500/10 text-sky-300'
                  : 'border-sky-200 bg-sky-50 text-sky-700'
              }`}
            >
              Top Match:{' '}
              {getFinalScoreLabel(
                topMatch
              )}
            </div>
          ) : null}
        </div>

        <div
          className={`mt-4 rounded-2xl border p-4 text-sm ${
            isDark
              ? 'border-slate-700 bg-slate-950 text-slate-300'
              : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          Final score is provided by the
          backend using: AI Match × 0.7 +
          Experience × 0.2 + Recency × 0.1.
          This page displays the real ranking
          values already returned by the API
          without recalculating them in React.
        </div>
      </div>

      {/* Search */}
      <div
        className={`rounded-3xl border p-5 ${panel}`}
      >
        <label
          className={`mb-2 block text-sm font-medium ${heading}`}
        >
          Search candidates
        </label>

        <input
          type="text"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(
              event.target.value
            )
          }
          placeholder="Search by name, email, or keyword"
          className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
            isDark
              ? 'border-slate-700 bg-slate-950 text-white placeholder:text-slate-400 focus:border-sky-500'
              : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-sky-400'
          }`}
        />
      </div>

      {/* Job information */}
      {job ? (
        <div
          className={`rounded-3xl border p-5 ${panel}`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] ${getStatusClasses(
                job.status,
                isDark
              )}`}
            >
              {job.status || 'Open'}
            </span>

            {job.location ? (
              <span
                className={`text-sm ${text}`}
              >
                {job.location}
              </span>
            ) : null}

            {job.employmentType ? (
              <span
                className={`text-sm ${text}`}
              >
                {job.employmentType}
              </span>
            ) : null}

            {job.roleLevel ? (
              <span
                className={`text-sm ${text}`}
              >
                {job.roleLevel}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({
            length: 3
          }).map((_, index) => (
            <div
              key={index}
              className={`animate-pulse rounded-3xl border p-5 ${panel}`}
            >
              <div
                className={`h-5 w-32 rounded ${
                  isDark
                    ? 'bg-slate-700'
                    : 'bg-slate-200'
                }`}
              />

              <div
                className={`mt-4 h-10 w-full rounded ${
                  isDark
                    ? 'bg-slate-700'
                    : 'bg-slate-200'
                }`}
              />
            </div>
          ))}
        </div>
      ) : filteredApplications.length ===
        0 ? (
        /* Empty */
        <div
          className={`rounded-3xl border p-8 text-center ${panel}`}
        >
          <div
            className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${
              isDark
                ? 'bg-slate-800 text-sky-300'
                : 'bg-sky-50 text-sky-700'
            }`}
          >
            ✦
          </div>

          <h3
            className={`text-2xl font-bold ${heading}`}
          >
            {searchTerm
              ? 'No matching candidates'
              : 'No applications yet'}
          </h3>

          <p
            className={`mt-2 text-sm ${text}`}
          >
            {searchTerm
              ? 'Try a different search term or clear the filter.'
              : 'Applications will appear here when candidates apply to this job.'}
          </p>
        </div>
      ) : (
        /* Applications */
        <div
          className={`overflow-hidden rounded-3xl border ${panel}`}
        >
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-slate-700/80 text-left">
              <thead
                className={
                  isDark
                    ? 'bg-slate-950/80 text-slate-300'
                    : 'bg-slate-50 text-slate-600'
                }
              >
                <tr>
                  <th className="px-5 py-4 text-sm font-medium">
                    Candidate
                  </th>

                  <th className="px-5 py-4 text-sm font-medium">
                    Match Score
                  </th>

                  <th className="px-5 py-4 text-sm font-medium">
                    Applied
                  </th>

                  <th className="px-5 py-4 text-sm font-medium">
                    Status
                  </th>

                  <th className="px-5 py-4 text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredApplications.map(
                  (application) => {
                    const actions =
                      getActionOptions(
                        application.status
                      );

                    const skills =
                      Array.isArray(
                        application
                          ?.candidate
                          ?.resume
                          ?.skills
                      )
                        ? application.candidate.resume.skills.slice(
                            0,
                            3
                          )
                        : [];

                    const isTopMatch =
                      topMatch &&
                      Number(
                        application.id
                      ) ===
                        Number(
                          topMatch.id
                        );

                    return (
                      <tr
                        key={
                          application.id
                        }
                        className={
                          isDark
                            ? 'border-t border-slate-700/80 bg-slate-900/70'
                            : 'border-t border-slate-200 bg-white'
                        }
                      >
                        {/* Candidate */}
                        <td className="px-5 py-4 align-top">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`font-semibold ${heading}`}
                              >
                                {getCandidateName(
                                  application
                                )}
                              </div>

                              {isTopMatch ? (
                                <span
                                  className={
                                    isDark
                                      ? 'rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-300'
                                      : 'rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-700'
                                  }
                                >
                                  Top match
                                </span>
                              ) : null}
                            </div>

                            {application
                              ?.candidate
                              ?.email ? (
                              <div
                                className={`text-sm ${text}`}
                              >
                                {
                                  application
                                    .candidate
                                    .email
                                }
                              </div>
                            ) : null}

                            {skills.length >
                            0 ? (
                              <div className="flex flex-wrap gap-2">
                                {skills.map(
                                  (skill) => (
                                    <span
                                      key={`${application.id}-${skill}`}
                                      className={
                                        isDark
                                          ? 'rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-200'
                                          : 'rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700'
                                      }
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            ) : null}
                          </div>
                        </td>

                        {/* Match */}
                        <td className="px-5 py-4 align-top">
                          <div
                            className={`font-medium ${heading}`}
                          >
                            {getMatchScoreLabel(
                              application
                            )}
                          </div>

                          <div
                            className={`mt-2 text-xs ${text}`}
                          >
                            Rank:{' '}
                            {getFinalScoreLabel(
                              application
                            )}
                          </div>

                          {application
                            ?.match
                            ?.strengths
                            ?.length ? (
                            <div
                              className={`mt-2 text-xs ${text}`}
                            >
                              Strengths:{' '}
                              {application.match.strengths
                                .slice(
                                  0,
                                  2
                                )
                                .join(
                                  ', '
                                )}
                            </div>
                          ) : null}
                        </td>

                        {/* Applied */}
                        <td
                          className={`px-5 py-4 align-top text-sm ${text}`}
                        >
                          {formatDate(
                            application.createdAt ||
                              application.created_at
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] ${getStatusClasses(
                              application.status,
                              isDark
                            )}`}
                          >
                            {application.status ||
                              'Applied'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 align-top">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/employer/candidates/${application.id}`,
                                  {
                                    state: {
                                      application,
                                      job
                                    }
                                  }
                                )
                              }
                              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                isDark
                                  ? 'border border-slate-700 bg-slate-950 text-slate-100 hover:border-sky-500'
                                  : 'border border-slate-200 bg-white text-slate-700 hover:border-sky-300'
                              }`}
                            >
                              View
                            </button>

                            {actions.map(
                              (action) => (
                                <button
                                  key={`${application.id}-${action.value}`}
                                  type="button"
                                  disabled={
                                    updatingId ===
                                    Number(
                                      application.id
                                    )
                                  }
                                  onClick={() =>
                                    setConfirmAction(
                                      {
                                        applicationId:
                                          Number(
                                            application.id
                                          ),
                                        status:
                                          action.value,
                                        label:
                                          action.label
                                      }
                                    )
                                  }
                                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                    isDark
                                      ? 'border border-slate-700 bg-slate-950 text-slate-100 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-70'
                                      : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-70'
                                  }`}
                                >
                                  {updatingId ===
                                  Number(
                                    application.id
                                  )
                                    ? 'Updating...'
                                    : action.label}
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-4 p-4 md:hidden">
            {filteredApplications.map(
              (application) => {
                const actions =
                  getActionOptions(
                    application.status
                  );

                const skills =
                  Array.isArray(
                    application
                      ?.candidate
                      ?.resume
                      ?.skills
                  )
                    ? application.candidate.resume.skills.slice(
                        0,
                        3
                      )
                    : [];

                const isTopMatch =
                  topMatch &&
                  Number(
                    application.id
                  ) ===
                    Number(
                      topMatch.id
                    );

                return (
                  <div
                    key={
                      application.id
                    }
                    className={`rounded-2xl border p-4 ${mutedPanel}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`font-semibold ${heading}`}
                          >
                            {getCandidateName(
                              application
                            )}
                          </div>

                          {isTopMatch ? (
                            <span
                              className={
                                isDark
                                  ? 'rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-300'
                                  : 'rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-700'
                              }
                            >
                              Top match
                            </span>
                          ) : null}
                        </div>

                        {application
                          ?.candidate
                          ?.email ? (
                          <div
                            className={`mt-1 text-xs ${text}`}
                          >
                            {
                              application
                                .candidate
                                .email
                            }
                          </div>
                        ) : null}
                      </div>

                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${getStatusClasses(
                          application.status,
                          isDark
                        )}`}
                      >
                        {application.status ||
                          'Applied'}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div
                          className={text}
                        >
                          Match
                        </div>

                        <div
                          className={`mt-1 font-medium ${heading}`}
                        >
                          {getMatchScoreLabel(
                            application
                          )}
                        </div>
                      </div>

                      <div>
                        <div
                          className={text}
                        >
                          Rank
                        </div>

                        <div
                          className={`mt-1 font-medium ${heading}`}
                        >
                          {getFinalScoreLabel(
                            application
                          )}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div
                          className={text}
                        >
                          Applied
                        </div>

                        <div
                          className={`mt-1 font-medium ${heading}`}
                        >
                          {formatDate(
                            application.createdAt ||
                              application.created_at
                          )}
                        </div>
                      </div>
                    </div>

                    {skills.length >
                    0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {skills.map(
                          (skill) => (
                            <span
                              key={`${application.id}-mobile-${skill}`}
                              className={
                                isDark
                                  ? 'rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-200'
                                  : 'rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700'
                              }
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/employer/candidates/${application.id}`,
                            {
                              state: {
                                application,
                                job
                              }
                            }
                          )
                        }
                        className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                          isDark
                            ? 'border border-slate-700 bg-slate-950 text-slate-100 hover:border-sky-500'
                            : 'border border-slate-200 bg-white text-slate-700 hover:border-sky-300'
                        }`}
                      >
                        View
                      </button>

                      {actions.length >
                      0
                        ? actions.map(
                            (action) => (
                              <button
                                key={`${application.id}-mobile-${action.value}`}
                                type="button"
                                disabled={
                                  updatingId ===
                                  Number(
                                    application.id
                                  )
                                }
                                onClick={() =>
                                  setConfirmAction(
                                    {
                                      applicationId:
                                        Number(
                                          application.id
                                        ),
                                      status:
                                        action.value,
                                      label:
                                        action.label
                                    }
                                  )
                                }
                                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                  isDark
                                    ? 'border border-slate-700 bg-slate-950 text-slate-100 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-70'
                                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-70'
                                }`}
                              >
                                {updatingId ===
                                Number(
                                  application.id
                                )
                                  ? 'Updating...'
                                  : action.label}
                              </button>
                            )
                          )
                        : null}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      <ConfirmDialog
        open={Boolean(
          confirmAction
        )}
        title={
          confirmAction
            ? `${confirmAction.label} candidate`
            : 'Update status'
        }
        message={
          confirmAction
            ? `Are you sure you want to ${confirmAction.label.toLowerCase()} this candidate?`
            : 'Update application status?'
        }
        confirmText={
          confirmAction?.label ||
          'Confirm'
        }
        cancelText="Cancel"
        onConfirm={
          handleStatusUpdate
        }
        onCancel={() =>
          setConfirmAction(null)
        }
        isDark={isDark}
        loading={
          Boolean(confirmAction) &&
          updatingId ===
            Number(
              confirmAction?.applicationId
            )
        }
      />
    </div>
  );
}