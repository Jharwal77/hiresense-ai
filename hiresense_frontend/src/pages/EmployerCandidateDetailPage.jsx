import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmployerNav from '../components/employer/EmployerNav';
import {
  getEmployerJobs,
  getJobApplications,
  updateApplicationStatus
} from '../services/employerApi';

const getFriendlyErrorMessage = (error) => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error?.message;

  if (status === 401 || status === 403) {
    return 'Your session has expired. Please log in again.';
  }

  if (status === 404) {
    return 'Candidate details could not be found.';
  }

  if (status === 409) {
    return 'This status change conflicts with the current application state.';
  }

  if (status === 422) {
    return 'Please choose a valid application status and try again.';
  }

  if (status === 500) {
    return 'We could not load this candidate profile right now. Please try again.';
  }

  if (message) {
    return message;
  }

  return 'Unable to load candidate details. Please try again.';
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
  if (!value) return 'Not available yet';

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

const arrayToList = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return 'Not available yet';
  }

  return items.filter(Boolean).join(', ');
};

const getActionOptions = (status) => {
  if (status === 'applied') {
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

  if (status === 'shortlisted') {
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

const findApplicationById = async (applicationId) => {
  const jobs = await getEmployerJobs();

  for (const job of jobs) {
    try {
      const response = await getJobApplications(
        job.id || job._id
      );

      const applications = Array.isArray(
        response?.applications
      )
        ? response.applications
        : [];

      const found = applications.find(
        (application) =>
          Number(application.id) === Number(applicationId)
      );

      if (found) {
        return {
          job: response?.job || job,
          application: found
        };
      }
    } catch (error) {
      if (error?.response?.status === 403) {
        continue;
      }

      throw error;
    }
  }

  return null;
};

export default function EmployerCandidateDetailPage({
  isDark
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

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

  useEffect(() => {
    let cancelled = false;

    const loadCandidate = async () => {
      if (cancelled) return;

      setLoading(true);
      setError('');

      try {
        const stateApplication =
          location.state?.application;

        const stateJob =
          location.state?.job;

        if (stateApplication) {
          if (!cancelled) {
            setDetail({
              job:
                stateJob ||
                stateApplication.job ||
                null,
              application: stateApplication
            });

            setLoading(false);
          }

          return;
        }

        const nextDetail =
          await findApplicationById(id);

        if (cancelled) {
          return;
        }

        if (!nextDetail) {
          setError('Candidate not found.');
          setDetail(null);
          return;
        }

        setDetail(nextDetail);
      } catch (requestError) {
        if (!cancelled) {
          setError(
            getFriendlyErrorMessage(requestError)
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCandidate();

    return () => {
      cancelled = true;
    };
  }, [id, location.state]);

  const application = detail?.application;
  const job =
    detail?.job ||
    application?.job ||
    null;

  const resume =
    application?.candidate?.resume ||
    null;

  const match =
    application?.match ||
    null;

  const ranking =
    application?.ranking ||
    null;

  const candidateName =
    application?.candidate?.name ||
    'Candidate';

  const candidateEmail =
    application?.candidate?.email ||
    'Not available yet';

  const applicationStatus =
    application?.status ||
    'applied';

  const appliedAt =
    application?.createdAt ||
    application?.created_at ||
    null;

  const interviewQuestions =
    match?.interviewQuestions ||
    application?.interviewQuestions ||
    [];

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

      setDetail((current) => {
        if (!current?.application) {
          return current;
        }

        return {
          ...current,
          application: {
            ...current.application,
            ...updatedApplication,
            status:
              updatedApplication?.status ||
              status,
            updatedAt:
              updatedApplication?.updated_at ||
              updatedApplication?.updatedAt ||
              current.application.updatedAt
          }
        };
      });

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

  const skills =
    Array.isArray(resume?.skills)
      ? resume.skills
      : [];

  const education =
    Array.isArray(resume?.education)
      ? resume.education
      : [];

  const workHistory =
    Array.isArray(resume?.workHistory)
      ? resume.workHistory
      : [];

  const jobActions = useMemo(
    () =>
      getActionOptions(
        applicationStatus
      ),
    [applicationStatus]
  );

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
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p
            className={
              isDark
                ? 'text-sm uppercase tracking-[0.2em] text-sky-300'
                : 'text-sm uppercase tracking-[0.2em] text-sky-700'
            }
          >
            Candidate profile
          </p>

          <h2
            className={`mt-2 text-3xl font-bold ${heading}`}
          >
            {candidateName}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${secondaryButton}`}
          >
            Back
          </button>

          {jobActions.length > 0
            ? jobActions.map((action) => (
                <button
                  key={action.value}
                  type="button"
                  disabled={
                    updatingId ===
                    Number(application?.id)
                  }
                  onClick={() =>
                    setConfirmAction({
                      applicationId:
                        Number(application?.id),
                      status: action.value,
                      label: action.label
                    })
                  }
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${primaryButton}`}
                >
                  {updatingId ===
                  Number(application?.id)
                    ? 'Updating...'
                    : action.label}
                </button>
              ))
            : null}
        </div>
      </div>

      <EmployerNav isDark={isDark} />

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

      {error ? (
        <div
          className={`rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm ${
            isDark
              ? 'text-red-200'
              : 'text-red-700'
          }`}
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-4">
          <div
            className={`animate-pulse rounded-3xl border p-5 ${panel}`}
          >
            <div
              className={`h-6 w-44 rounded ${
                isDark
                  ? 'bg-slate-700'
                  : 'bg-slate-200'
              }`}
            />

            <div
              className={`mt-4 h-24 w-full rounded ${
                isDark
                  ? 'bg-slate-700'
                  : 'bg-slate-200'
              }`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div
              className={`animate-pulse rounded-3xl border p-5 ${panel}`}
            >
              <div
                className={`h-4 w-32 rounded ${
                  isDark
                    ? 'bg-slate-700'
                    : 'bg-slate-200'
                }`}
              />

              <div
                className={`mt-3 h-20 w-full rounded ${
                  isDark
                    ? 'bg-slate-700'
                    : 'bg-slate-200'
                }`}
              />
            </div>

            <div
              className={`animate-pulse rounded-3xl border p-5 ${panel}`}
            >
              <div
                className={`h-4 w-32 rounded ${
                  isDark
                    ? 'bg-slate-700'
                    : 'bg-slate-200'
                }`}
              />

              <div
                className={`mt-3 h-20 w-full rounded ${
                  isDark
                    ? 'bg-slate-700'
                    : 'bg-slate-200'
                }`}
              />
            </div>
          </div>
        </div>
      ) : detail && application ? (
        <div className="space-y-6">
          <div
            className={`rounded-3xl border p-5 ${panel}`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className={`text-sm ${text}`}>
                  Candidate summary
                </div>

                <div
                  className={`text-xl font-semibold ${heading}`}
                >
                  {candidateName}
                </div>

                <div className={`text-sm ${text}`}>
                  {candidateEmail}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] ${getStatusClasses(
                    applicationStatus,
                    isDark
                  )}`}
                >
                  {applicationStatus ||
                    'Applied'}
                </span>

                {resume?.sourceDocument
                  ?.secureUrl ? (
                  <a
                    href={
                      resume.sourceDocument
                        .secureUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex rounded-xl px-3 py-2 text-sm font-medium transition ${primaryButton}`}
                  >
                    View Resume
                  </a>
                ) : (
                  <span
                    className={`inline-flex rounded-xl border px-3 py-2 text-sm font-medium ${
                      isDark
                        ? 'border-slate-700 bg-slate-950 text-slate-300'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    Resume unavailable
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div
                className={`rounded-2xl border p-4 ${mutedPanel}`}
              >
                <div
                  className={`text-xs uppercase tracking-[0.14em] ${text}`}
                >
                  Applied
                </div>

                <div
                  className={`mt-2 font-semibold ${heading}`}
                >
                  {formatDate(appliedAt)}
                </div>
              </div>

              <div
                className={`rounded-2xl border p-4 ${mutedPanel}`}
              >
                <div
                  className={`text-xs uppercase tracking-[0.14em] ${text}`}
                >
                  Job
                </div>

                <div
                  className={`mt-2 font-semibold ${heading}`}
                >
                  {job?.title ||
                    'Not available yet'}
                </div>
              </div>

              <div
                className={`rounded-2xl border p-4 ${mutedPanel}`}
              >
                <div
                  className={`text-xs uppercase tracking-[0.14em] ${text}`}
                >
                  Rank
                </div>

                <div
                  className={`mt-2 font-semibold ${heading}`}
                >
                  {ranking?.finalScore !==
                  undefined
                    ? `${ranking.finalScore}`
                    : 'Not ranked yet'}
                </div>
              </div>

              <div
                className={`rounded-2xl border p-4 ${mutedPanel}`}
              >
                <div
                  className={`text-xs uppercase tracking-[0.14em] ${text}`}
                >
                  Application ID
                </div>

                <div
                  className={`mt-2 font-semibold ${heading}`}
                >
                  {application?.id ||
                    'Not available yet'}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`rounded-3xl border p-5 ${panel}`}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className={`text-sm ${text}`}>
                  Assessment summary
                </p>

                <h3
                  className={`mt-1 text-xl font-semibold ${heading}`}
                >
                  AI screening and ranking
                </h3>
              </div>

              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                  isDark
                    ? 'border-sky-500/30 bg-sky-500/10 text-sky-300'
                    : 'border-sky-200 bg-sky-50 text-sky-700'
                }`}
              >
                {match?.matchScore !==
                  undefined &&
                match?.matchScore !== null
                  ? `AI Match ${match.matchScore}`
                  : 'AI Match Not available yet'}
              </span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div
                className={`rounded-2xl border p-4 ${mutedPanel}`}
              >
                <div
                  className={`text-xs uppercase tracking-[0.14em] ${text}`}
                >
                  AI Match
                </div>

                <div
                  className={`mt-2 text-2xl font-bold ${heading}`}
                >
                  {match?.matchScore !==
                    undefined &&
                  match?.matchScore !== null
                    ? `${match.matchScore}`
                    : 'Not available yet'}
                </div>
              </div>

              <div
                className={`rounded-2xl border p-4 ${mutedPanel}`}
              >
                <div
                  className={`text-xs uppercase tracking-[0.14em] ${text}`}
                >
                  Experience score
                </div>

                <div
                  className={`mt-2 text-2xl font-bold ${heading}`}
                >
                  {ranking?.experienceScore !==
                    undefined &&
                  ranking?.experienceScore !==
                    null
                    ? `${ranking.experienceScore}`
                    : 'Not available yet'}
                </div>
              </div>

              <div
                className={`rounded-2xl border p-4 ${mutedPanel}`}
              >
                <div
                  className={`text-xs uppercase tracking-[0.14em] ${text}`}
                >
                  Recency score
                </div>

                <div
                  className={`mt-2 text-2xl font-bold ${heading}`}
                >
                  {ranking?.recencyScore !==
                    undefined &&
                  ranking?.recencyScore !==
                    null
                    ? `${ranking.recencyScore}`
                    : 'Not available yet'}
                </div>
              </div>
            </div>

            <div
              className={`mt-4 rounded-2xl border p-4 text-sm ${
                isDark
                  ? 'border-slate-700 bg-slate-950 text-slate-300'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              Ranking is computed by the backend as:
              AI Match × 0.7 + Experience × 0.2 +
              Recency × 0.1. This page surfaces the
              server-authoritative values only and never
              recalculates the formula in React.
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <section
                className={`rounded-3xl border p-5 ${panel}`}
              >
                <h3
                  className={`text-xl font-semibold ${heading}`}
                >
                  Resume profile
                </h3>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div
                    className={`rounded-2xl border p-4 ${mutedPanel}`}
                  >
                    <div
                      className={`text-xs uppercase tracking-[0.14em] ${text}`}
                    >
                      Experience
                    </div>

                    <div
                      className={`mt-2 font-semibold ${heading}`}
                    >
                      {resume?.experienceYears !==
                        undefined &&
                      resume?.experienceYears !==
                        null
                        ? `${resume.experienceYears} years`
                        : 'Not available yet'}
                    </div>
                  </div>

                  <div
                    className={`rounded-2xl border p-4 ${mutedPanel}`}
                  >
                    <div
                      className={`text-xs uppercase tracking-[0.14em] ${text}`}
                    >
                      Skills
                    </div>

                    <div
                      className={`mt-2 font-semibold ${heading}`}
                    >
                      {skills.length > 0
                        ? arrayToList(skills)
                        : 'Not available yet'}
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <div
                    className={`mb-3 text-sm font-medium ${heading}`}
                  >
                    Education
                  </div>

                  {education.length > 0 ? (
                    <div className="space-y-3">
                      {education.map(
                        (item, index) => (
                          <div
                            key={`${item.institution || 'education'}-${index}`}
                            className={`rounded-2xl border p-4 ${mutedPanel}`}
                          >
                            <div
                              className={`font-semibold ${heading}`}
                            >
                              {item.institution ||
                                'Institution not specified'}
                            </div>

                            <div
                              className={`mt-1 text-sm ${text}`}
                            >
                              {[
                                item.degree,
                                item.field
                              ]
                                .filter(Boolean)
                                .join(' • ') ||
                                'Degree not specified'}
                            </div>

                            <div
                              className={`mt-1 text-sm ${text}`}
                            >
                              {item.startYear ||
                              item.endYear
                                ? `${item.startYear || ''}${
                                    item.startYear &&
                                    item.endYear
                                      ? ' - '
                                      : ''
                                  }${
                                    item.endYear ||
                                    ''
                                  }`
                                : 'Years not specified'}
                            </div>

                            {item.details ? (
                              <div
                                className={`mt-2 text-sm ${text}`}
                              >
                                {item.details}
                              </div>
                            ) : null}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div
                      className={`rounded-2xl border p-4 text-sm ${text}`}
                    >
                      No education information
                      available
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <div
                    className={`mb-3 text-sm font-medium ${heading}`}
                  >
                    Work history
                  </div>

                  {workHistory.length > 0 ? (
                    <div className="space-y-3">
                      {workHistory.map(
                        (item, index) => (
                          <div
                            key={`${item.company || 'work'}-${index}`}
                            className={`rounded-2xl border p-4 ${mutedPanel}`}
                          >
                            <div
                              className={`font-semibold ${heading}`}
                            >
                              {item.company ||
                                'Company not specified'}
                            </div>

                            <div
                              className={`mt-1 text-sm ${text}`}
                            >
                              {[
                                item.role,
                                item.startDate,
                                item.endDate
                              ]
                                .filter(Boolean)
                                .join(' • ') ||
                                'Role not specified'}
                            </div>

                            {item.description ? (
                              <div
                                className={`mt-2 text-sm ${text}`}
                              >
                                {item.description}
                              </div>
                            ) : null}

                            {Array.isArray(
                              item.skills
                            ) &&
                            item.skills.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {item.skills.map(
                                  (skill) => (
                                    <span
                                      key={`${item.company}-${skill}`}
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
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div
                      className={`rounded-2xl border p-4 text-sm ${text}`}
                    >
                      No work history available
                    </div>
                  )}
                </div>
              </section>

              <section
                className={`rounded-3xl border p-5 ${panel}`}
              >
                <h3
                  className={`text-xl font-semibold ${heading}`}
                >
                  AI Resume Analysis
                </h3>

                {resume ? (
                  <div className="mt-5 space-y-4">
                    <div
                      className={`rounded-2xl border p-4 ${mutedPanel}`}
                    >
                      <div
                        className={`text-xs uppercase tracking-[0.14em] ${text}`}
                      >
                        Resume Score
                      </div>

                      <div
                        className={`mt-2 text-2xl font-bold ${heading}`}
                      >
                        {resume.resumeScore !==
                          null &&
                        resume.resumeScore !==
                          undefined
                          ? `${resume.resumeScore}`
                          : 'Not available yet'}
                      </div>
                    </div>

                    <div
                      className={`rounded-2xl border p-4 ${mutedPanel}`}
                    >
                      <div
                        className={`text-xs uppercase tracking-[0.14em] ${text}`}
                      >
                        Strengths
                      </div>

                      <div
                        className={`mt-2 text-sm ${heading}`}
                      >
                        {Array.isArray(
                          resume.resumeStrengths
                        ) &&
                        resume.resumeStrengths
                          .length > 0
                          ? resume.resumeStrengths.join(
                              ', '
                            )
                          : 'Not available yet'}
                      </div>
                    </div>

                    <div
                      className={`rounded-2xl border p-4 ${mutedPanel}`}
                    >
                      <div
                        className={`text-xs uppercase tracking-[0.14em] ${text}`}
                      >
                        Areas to Improve
                      </div>

                      <div
                        className={`mt-2 text-sm ${heading}`}
                      >
                        {Array.isArray(
                          resume.resumeGaps
                        ) &&
                        resume.resumeGaps.length >
                          0
                          ? resume.resumeGaps.join(
                              ', '
                            )
                          : 'Not available yet'}
                      </div>
                    </div>

                    <div
                      className={`rounded-2xl border p-4 ${mutedPanel}`}
                    >
                      <div
                        className={`text-xs uppercase tracking-[0.14em] ${text}`}
                      >
                        Analysis Status
                      </div>

                      <div
                        className={`mt-2 text-sm ${heading}`}
                      >
                        {resume.aiStatus ||
                          'Not available yet'}
                      </div>

                      {resume.aiError ? (
                        <div
                          className={`mt-2 text-sm ${
                            isDark
                              ? 'text-red-200'
                              : 'text-red-700'
                          }`}
                        >
                          {resume.aiError}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`mt-5 rounded-2xl border p-4 text-sm ${text}`}
                  >
                    AI resume analysis not available
                    yet
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-6">
              <section
                className={`rounded-3xl border p-5 ${panel}`}
              >
                <h3
                  className={`text-xl font-semibold ${heading}`}
                >
                  AI Match
                </h3>

                {match ? (
                  <div className="mt-5 space-y-4">
                    <div
                      className={`rounded-2xl border p-4 ${mutedPanel}`}
                    >
                      <div
                        className={`text-xs uppercase tracking-[0.14em] ${text}`}
                      >
                        AI Match Score
                      </div>

                      <div
                        className={`mt-2 text-2xl font-bold ${heading}`}
                      >
                        {match.matchScore !==
                          undefined &&
                        match.matchScore !== null
                          ? `${match.matchScore}`
                          : 'Not available yet'}
                      </div>
                    </div>

                    <div
                      className={`rounded-2xl border p-4 ${mutedPanel}`}
                    >
                      <div
                        className={`text-xs uppercase tracking-[0.14em] ${text}`}
                      >
                        Reasoning
                      </div>

                      <div
                        className={`mt-2 text-sm leading-6 ${heading}`}
                      >
                        {match.reasoning ||
                          'Not available yet'}
                      </div>
                    </div>

                    <div
                      className={`rounded-2xl border p-4 ${mutedPanel}`}
                    >
                      <div
                        className={`text-xs uppercase tracking-[0.14em] ${text}`}
                      >
                        Strengths
                      </div>

                      <div
                        className={`mt-2 text-sm ${heading}`}
                      >
                        {Array.isArray(
                          match.strengths
                        ) &&
                        match.strengths.length >
                          0
                          ? match.strengths.join(
                              ', '
                            )
                          : 'Not available yet'}
                      </div>
                    </div>

                    <div
                      className={`rounded-2xl border p-4 ${mutedPanel}`}
                    >
                      <div
                        className={`text-xs uppercase tracking-[0.14em] ${text}`}
                      >
                        Skill Gaps
                      </div>

                      <div
                        className={`mt-2 text-sm ${heading}`}
                      >
                        {Array.isArray(
                          match.gaps
                        ) &&
                        match.gaps.length > 0
                          ? match.gaps.join(
                              ', '
                            )
                          : 'Not available yet'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`mt-5 rounded-2xl border p-4 text-sm ${text}`}
                  >
                    Match analysis not available
                    yet
                  </div>
                )}
              </section>

              <section
                className={`rounded-3xl border p-5 ${panel}`}
              >
                <h3
                  className={`text-xl font-semibold ${heading}`}
                >
                  Ranking
                </h3>

                {ranking ? (
                  <div className="mt-5 space-y-3">
                    <div
                      className={`rounded-2xl border p-4 ${mutedPanel}`}
                    >
                      <div
                        className={`text-xs uppercase tracking-[0.14em] ${text}`}
                      >
                        Final score
                      </div>

                      <div
                        className={`mt-2 font-semibold ${heading}`}
                      >
                        {ranking.finalScore !==
                          undefined &&
                        ranking.finalScore !== null
                          ? `${ranking.finalScore}`
                          : 'Not ranked yet'}
                      </div>
                    </div>

                    <div
                      className={`rounded-2xl border p-4 ${mutedPanel}`}
                    >
                      <div
                        className={`text-xs uppercase tracking-[0.14em] ${text}`}
                      >
                        Experience score
                      </div>

                      <div
                        className={`mt-2 font-semibold ${heading}`}
                      >
                        {ranking.experienceScore !==
                          undefined &&
                        ranking.experienceScore !==
                          null
                          ? `${ranking.experienceScore}`
                          : 'Not available yet'}
                      </div>
                    </div>

                    <div
                      className={`rounded-2xl border p-4 ${mutedPanel}`}
                    >
                      <div
                        className={`text-xs uppercase tracking-[0.14em] ${text}`}
                      >
                        Recency score
                      </div>

                      <div
                        className={`mt-2 font-semibold ${heading}`}
                      >
                        {ranking.recencyScore !==
                          undefined &&
                        ranking.recencyScore !==
                          null
                          ? `${ranking.recencyScore}`
                          : 'Not available yet'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`mt-5 rounded-2xl border p-4 text-sm ${text}`}
                  >
                    Not ranked yet
                  </div>
                )}
              </section>

              <section
                className={`rounded-3xl border p-5 ${panel}`}
              >
                <h3
                  className={`text-xl font-semibold ${heading}`}
                >
                  AI Screening Questions
                </h3>

                {Array.isArray(
                  interviewQuestions
                ) &&
                interviewQuestions.length > 0 ? (
                  <ol className="mt-5 space-y-3">
                    {interviewQuestions.map(
                      (question, index) => (
                        <li
                          key={`${question}-${index}`}
                          className={`rounded-2xl border p-4 ${mutedPanel}`}
                        >
                          <div
                            className={`text-xs uppercase tracking-[0.14em] ${text}`}
                          >
                            Question {index + 1}
                          </div>

                          <div
                            className={`mt-2 text-sm leading-6 ${heading}`}
                          >
                            {question}
                          </div>
                        </li>
                      )
                    )}
                  </ol>
                ) : (
                  <div
                    className={`mt-5 rounded-2xl border p-4 text-sm ${text}`}
                  >
                    Interview questions not
                    available yet
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmAction)}
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
          confirmAction?.label || 'Confirm'
        }
        cancelText="Cancel"
        onConfirm={handleStatusUpdate}
        onCancel={() =>
          setConfirmAction(null)
        }
        isDark={isDark}
        loading={
          Boolean(confirmAction) &&
          updatingId ===
            Number(
              confirmAction.applicationId
            )
        }
      />
    </div>
  );
}