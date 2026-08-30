import {
  useEffect,
  useMemo,
  useState
} from 'react';
import { Link, useLocation } from 'react-router-dom';
import EmployerNav from '../components/employer/EmployerNav';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  closeEmployerJob,
  deleteEmployerJob,
  getEmployerJobs
} from '../services/employerApi';

const formatDate = (value) => {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const getJobValue = (job, ...keys) => {
  for (const key of keys) {
    const value = job?.[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      return value;
    }
  }

  return undefined;
};

const formatExperienceRange = (job) => {
  const min = Number(
    getJobValue(
      job,
      'experienceMin',
      'experience_min',
      'minExperience'
    )
  );

  const max = Number(
    getJobValue(
      job,
      'experienceMax',
      'experience_max',
      'maxExperience'
    )
  );

  if (
    Number.isFinite(min) &&
    Number.isFinite(max)
  ) {
    return `${min}–${max} years`;
  }

  if (Number.isFinite(min)) {
    return `${min}+ years`;
  }

  if (Number.isFinite(max)) {
    return `${max} years`;
  }

  return 'Experience not specified';
};

const formatSalaryRange = (job) => {
  const min = Number(
    getJobValue(
      job,
      'salaryMin',
      'salary_min',
      'minSalary'
    )
  );

  const max = Number(
    getJobValue(
      job,
      'salaryMax',
      'salary_max',
      'maxSalary'
    )
  );

  if (
    !Number.isFinite(min) &&
    !Number.isFinite(max)
  ) {
    return 'Salary not specified';
  }

  const money = (value) => {
    if (!Number.isFinite(value)) {
      return null;
    }

    const lakhValue = value / 100000;

    return Number.isInteger(lakhValue)
      ? lakhValue
      : Number(lakhValue.toFixed(1));
  };

  const formattedMin = money(min);
  const formattedMax = money(max);

  if (
    Number.isFinite(min) &&
    Number.isFinite(max)
  ) {
    return `₹${formattedMin} LPA – ₹${formattedMax} LPA`;
  }

  if (Number.isFinite(min)) {
    return `₹${formattedMin} LPA+`;
  }

  return `Up to ₹${formattedMax} LPA`;
};

const getStatusTone = (status, isDark) => {
  const normalized = String(
    status || 'open'
  ).toLowerCase();

  if (normalized === 'closed') {
    return isDark
      ? 'border-slate-600 bg-slate-800 text-slate-200'
      : 'border-slate-200 bg-slate-100 text-slate-700';
  }

  if (normalized === 'draft') {
    return isDark
      ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
      : 'border-amber-200 bg-amber-50 text-amber-700';
  }

  return isDark
    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
    : 'border-emerald-200 bg-emerald-50 text-emerald-700';
};

export default function EmployerJobsPage({
  isDark
}) {
  const location = useLocation();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(
    location.state?.toast || ''
  );
  const [deleteTarget, setDeleteTarget] =
    useState(null);
  const [actionLoadingId, setActionLoadingId] =
    useState(null);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = setTimeout(
      () => setToast(''),
      2600
    );

    return () => clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    let mounted = true;

    const loadInitialJobs = async () => {
      try {
        const data = await getEmployerJobs();

        if (!mounted) {
          return;
        }

        setJobs(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        setError(
          requestError?.response?.data?.message ||
            'Unable to load your jobs right now.'
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadInitialJobs();

    return () => {
      mounted = false;
    };
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getEmployerJobs();

      setJobs(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'Unable to load your jobs right now.'
      );
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = useMemo(() => {
    const open = jobs.filter((job) =>
      ['open', 'active'].includes(
        String(
          job?.status || ''
        ).toLowerCase()
      )
    ).length;

    const closed = jobs.filter(
      (job) =>
        String(
          job?.status || ''
        ).toLowerCase() === 'closed'
    ).length;

    return {
      totalJobs: jobs.length,
      openJobs: open,
      closedJobs: closed
    };
  }, [jobs]);

  const handleClose = async (job) => {
    const jobId =
      job?._id || job?.id;

    if (!jobId) {
      return;
    }

    setActionLoadingId(jobId);

    try {
      await closeEmployerJob(jobId);

      setJobs((current) =>
        current.map((item) =>
          (item?._id || item?.id) === jobId
            ? {
                ...item,
                status: 'closed'
              }
            : item
        )
      );

      setToast(
        'Job closed successfully.'
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'Unable to close this job right now.'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    const jobId =
      deleteTarget?._id ||
      deleteTarget?.id;

    if (!jobId) {
      setDeleteTarget(null);
      return;
    }

    setActionLoadingId(jobId);

    try {
      await deleteEmployerJob(jobId);

      setJobs((current) =>
        current.filter(
          (item) =>
            (item?._id || item?.id) !==
            jobId
        )
      );

      setDeleteTarget(null);

      setToast(
        'Job deleted successfully.'
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'Unable to delete this job right now.'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const panel = isDark
    ? 'border-slate-700 bg-slate-900'
    : 'border-slate-200 bg-white';

  const subtle = isDark
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
            Employer jobs
          </p>

          <h2
            className={`mt-2 text-3xl font-bold ${heading}`}
          >
            Manage jobs
          </h2>
        </div>

        <Link
          to="/employer/jobs/create"
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${primaryButton}`}
        >
          Post a Job
        </Link>
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>

            <button
              type="button"
              onClick={loadJobs}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${primaryButton}`}
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          {
            label: 'Total Jobs',
            value:
              dashboardStats.totalJobs
          },
          {
            label: 'Open Jobs',
            value:
              dashboardStats.openJobs
          },
          {
            label: 'Closed Jobs',
            value:
              dashboardStats.closedJobs
          }
        ].map((item) => (
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
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map(
            (_, index) => (
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
                  className={`mt-4 h-6 w-2/3 rounded ${
                    isDark
                      ? 'bg-slate-700'
                      : 'bg-slate-200'
                  }`}
                />

                <div
                  className={`mt-3 h-4 w-1/2 rounded ${
                    isDark
                      ? 'bg-slate-700'
                      : 'bg-slate-200'
                  }`}
                />
              </div>
            )
          )}
        </div>
      ) : jobs.length === 0 ? (
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
            No jobs posted yet
          </h3>

          <p
            className={`mt-2 text-sm ${text}`}
          >
            Create your first job listing to
            start hiring.
          </p>

          <Link
            to="/employer/jobs/create"
            className={`mt-5 inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold transition ${primaryButton}`}
          >
            Post your first job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const jobId =
              job?._id || job?.id;

            const isClosed =
              String(
                job?.status || ''
              ).toLowerCase() ===
              'closed';

            const statusClass =
              getStatusTone(
                job?.status,
                isDark
              );

            return (
              <article
                key={jobId}
                className={`rounded-3xl border p-5 transition duration-200 hover:-translate-y-0.5 ${panel}`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-xl font-semibold ${heading}`}
                      >
                        {job?.title ||
                          'Untitled role'}
                      </h3>

                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] ${statusClass}`}
                      >
                        {job?.status ||
                          'Open'}
                      </span>
                    </div>

                    <div
                      className={`flex flex-wrap items-center gap-3 text-sm ${text}`}
                    >
                      <span>
                        {job?.location ||
                          'Location not specified'}
                      </span>

                      <span>•</span>

                      <span>
                        {job?.employmentType ||
                          job?.employment_type ||
                          'Employment type not specified'}
                      </span>

                      <span>•</span>

                      <span>
                        {job?.roleLevel ||
                          job?.role_level ||
                          'Role level not specified'}
                      </span>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div
                        className={`rounded-2xl border p-3 ${subtle}`}
                      >
                        <div
                          className={`text-[11px] uppercase tracking-[0.14em] ${text}`}
                        >
                          Experience
                        </div>

                        <div
                          className={`mt-2 font-medium ${heading}`}
                        >
                          {formatExperienceRange(
                            job
                          )}
                        </div>
                      </div>

                      <div
                        className={`rounded-2xl border p-3 ${subtle}`}
                      >
                        <div
                          className={`text-[11px] uppercase tracking-[0.14em] ${text}`}
                        >
                          Salary
                        </div>

                        <div
                          className={`mt-2 font-medium ${heading}`}
                        >
                          {formatSalaryRange(
                            job
                          )}
                        </div>
                      </div>

                      <div
                        className={`rounded-2xl border p-3 ${subtle}`}
                      >
                        <div
                          className={`text-[11px] uppercase tracking-[0.14em] ${text}`}
                        >
                          Created
                        </div>

                        <div
                          className={`mt-2 font-medium ${heading}`}
                        >
                          {formatDate(
                            job?.createdAt ||
                              job?.created_at
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      to={`/employer/jobs/${jobId}/applications`}
                      className={`rounded-xl px-3 py-2 text-sm font-medium transition ${secondaryButton}`}
                    >
                      Applications
                    </Link>

                    <Link
                      to={`/employer/jobs/${jobId}/edit`}
                      className={`rounded-xl px-3 py-2 text-sm font-medium transition ${secondaryButton}`}
                    >
                      Edit
                    </Link>

                    {!isClosed ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleClose(job)
                        }
                        disabled={
                          actionLoadingId ===
                          jobId
                        }
                        className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                          isDark
                            ? 'border border-slate-700 bg-slate-950 text-slate-100 hover:border-slate-500'
                            : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        } disabled:cursor-not-allowed disabled:opacity-70`}
                      >
                        {actionLoadingId ===
                        jobId
                          ? 'Working...'
                          : 'Close'}
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget(job)
                      }
                      className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-500/20 dark:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete job"
        message={`Are you sure you want to delete "${
          deleteTarget?.title ||
          'this job'
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() =>
          setDeleteTarget(null)
        }
        isDark={isDark}
        loading={
          Boolean(deleteTarget) &&
          actionLoadingId ===
            (
              deleteTarget?._id ||
              deleteTarget?.id
            )
        }
      />
    </div>
  );
}