import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { Link } from 'react-router-dom';
import EmployerNav from '../components/employer/EmployerNav';
import { useAuth } from '../context/useAuth';
import { getEmployerJobs } from '../services/employerApi';

const formatDate = (value) => {
  if (!value) return 'Recently';

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

const formatExperienceRange = (job) => {
  const min = Number(
    job?.experienceMin ??
      job?.experience_min ??
      job?.minExperience
  );

  const max = Number(
    job?.experienceMax ??
      job?.experience_max ??
      job?.maxExperience
  );

  if (Number.isFinite(min) && Number.isFinite(max)) {
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
    job?.salaryMin ??
      job?.salary_min ??
      job?.minSalary
  );

  const max = Number(
    job?.salaryMax ??
      job?.salary_max ??
      job?.maxSalary
  );

  if (
    !Number.isFinite(min) &&
    !Number.isFinite(max)
  ) {
    return 'Salary not specified';
  }

  const toLpa = (value) => {
    const lakhValue = value / 100000;

    return Number.isInteger(lakhValue)
      ? lakhValue
      : Number(lakhValue.toFixed(1));
  };

  if (
    Number.isFinite(min) &&
    Number.isFinite(max)
  ) {
    return `₹${toLpa(min)} LPA – ₹${toLpa(max)} LPA`;
  }

  if (Number.isFinite(min)) {
    return `₹${toLpa(min)} LPA+`;
  }

  return `Up to ₹${toLpa(max)} LPA`;
};

const formatRoleLevel = (value) => {
  if (
    !value ||
    String(value).trim().toLowerCase() ===
      'not specified'
  ) {
    return 'Not specified';
  }

  return String(value).trim();
};

const countValue = (value) => {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
};

export default function EmployerDashboard({
  isDark
}) {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const employerJobs =
        await getEmployerJobs();

      setJobs(
        Array.isArray(employerJobs)
          ? employerJobs
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
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchJobs = async () => {
      if (cancelled) {
        return;
      }

      await loadJobs();
    };

    fetchJobs();

    return () => {
      cancelled = true;
    };
  }, [loadJobs]);

  const stats = useMemo(() => {
    const totalJobs = jobs.length;

    const openJobs = jobs.filter((job) => {
      const status = String(
        job?.status || 'open'
      ).toLowerCase();

      return (
        status === 'open' ||
        status === 'active'
      );
    }).length;

    const closedJobs = jobs.filter(
      (job) =>
        String(
          job?.status || ''
        ).toLowerCase() === 'closed'
    ).length;

    const totalApplications =
      jobs.reduce(
        (sum, job) =>
          sum +
          countValue(
            job?.totalApplications ??
              job?.applicationCount ??
              job?.applicationsCount ??
              job?.applications
          ),
        0
      );

    const shortlisted =
      jobs.reduce(
        (sum, job) =>
          sum +
          countValue(
            job?.shortlistedCount ??
              job?.shortlisted ??
              job?.totalShortlisted
          ),
        0
      );

    const hired =
      jobs.reduce(
        (sum, job) =>
          sum +
          countValue(
            job?.hiredCount ??
              job?.hired ??
              job?.totalHired
          ),
        0
      );

    return [
      {
        label: 'Total Jobs',
        value: totalJobs
      },
      {
        label: 'Open Jobs',
        value: openJobs
      },
      {
        label: 'Closed Jobs',
        value: closedJobs
      },
      {
        label: 'Total Applications',
        value:
          totalApplications > 0
            ? totalApplications
            : 'Not available yet'
      },
      {
        label: 'Shortlisted',
        value:
          shortlisted > 0
            ? shortlisted
            : 'Not available yet'
      },
      {
        label: 'Hired',
        value:
          hired > 0
            ? hired
            : 'Not available yet'
      }
    ];
  }, [jobs]);

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

  const soft = isDark
    ? 'text-slate-400'
    : 'text-slate-500';

  const accent = isDark
    ? 'border-sky-500/30 bg-sky-500/10 text-sky-300'
    : 'border-sky-200 bg-sky-50 text-sky-700';

  const primaryButton = isDark
    ? 'bg-white text-slate-900 hover:bg-slate-200'
    : 'bg-slate-900 text-white hover:bg-slate-800';

  const secondaryButton = isDark
    ? 'border border-slate-700 bg-slate-950 text-slate-100 hover:border-slate-500'
    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p
            className={
              isDark
                ? 'text-sm uppercase tracking-[0.2em] text-sky-300'
                : 'text-sm uppercase tracking-[0.2em] text-sky-700'
            }
          >
            Employer dashboard
          </p>

          <h2
            className={`mt-2 text-3xl font-bold ${heading}`}
          >
            Welcome back, {user?.name || 'Employer'}
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/employer/jobs/create"
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${primaryButton}`}
          >
            Post a Job
          </Link>

          <Link
            to="/employer/jobs"
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${secondaryButton}`}
          >
            Manage Jobs
          </Link>

          <Link
            to="/employer/company"
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${secondaryButton}`}
          >
            Company Profile
          </Link>
        </div>
      </div>

      <EmployerNav isDark={isDark} />

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

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className={`animate-pulse rounded-2xl border p-5 ${panel}`}
              >
                <div
                  className={`mb-3 h-3 w-20 rounded ${
                    isDark
                      ? 'bg-slate-700'
                      : 'bg-slate-200'
                  }`}
                />

                <div
                  className={`h-8 w-16 rounded ${
                    isDark
                      ? 'bg-slate-700'
                      : 'bg-slate-200'
                  }`}
                />
              </div>
            )
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className={`rounded-2xl border p-5 transition duration-200 hover:-translate-y-0.5 ${panel}`}
            >
              <div className={`text-sm ${text}`}>
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
      )}

      <section
        className={`rounded-3xl border p-5 ${panel}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={`text-sm ${text}`}>
              Recent jobs
            </p>

            <h3
              className={`mt-1 text-2xl font-bold ${heading}`}
            >
              Posted roles
            </h3>
          </div>

          <Link
            to="/employer/jobs"
            className={
              isDark
                ? 'text-sm font-medium text-sky-300 hover:text-sky-200'
                : 'text-sm font-medium text-sky-700 hover:text-sky-800'
            }
          >
            View Jobs
          </Link>
        </div>

        {loading ? (
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }).map(
              (_, index) => (
                <div
                  key={index}
                  className={`animate-pulse rounded-2xl border p-4 ${subtle}`}
                >
                  <div
                    className={`h-5 w-32 rounded ${
                      isDark
                        ? 'bg-slate-700'
                        : 'bg-slate-200'
                    }`}
                  />

                  <div
                    className={`mt-3 h-4 w-40 rounded ${
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
            className={`mt-5 rounded-2xl border border-dashed p-8 text-center ${subtle}`}
          >
            <p
              className={`text-lg font-semibold ${heading}`}
            >
              No jobs posted yet
            </p>

            <p
              className={`mt-2 text-sm ${soft}`}
            >
              Start by posting your first role to
              find the right candidates.
            </p>

            <Link
              to="/employer/jobs/create"
              className={`mt-4 inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold transition ${primaryButton}`}
            >
              Post your first job
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {jobs.slice(0, 4).map((job) => (
              <div
                key={
                  job.id ||
                  job._id ||
                  `${job.title}-${job.location}`
                }
                className={`rounded-2xl border p-4 transition duration-200 hover:-translate-y-0.5 ${subtle}`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p
                      className={`text-lg font-semibold ${heading}`}
                    >
                      {job.title ||
                        'Untitled role'}
                    </p>

                    <div
                      className={`mt-1 flex flex-wrap gap-2 text-sm ${soft}`}
                    >
                      <span>
                        {job.location ||
                          'Location not specified'}
                      </span>

                      <span>•</span>

                      <span>
                        {job.employmentType ||
                          'Employment type not specified'}
                      </span>

                      <span>•</span>

                      <span>
                        {formatRoleLevel(
                          job.roleLevel
                        )}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${accent}`}
                  >
                    {String(
                      job.status || 'open'
                    )
                      .charAt(0)
                      .toUpperCase() +
                      String(
                        job.status || 'open'
                      ).slice(1)}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div>
                    <p
                      className={`text-[11px] uppercase tracking-[0.2em] ${soft}`}
                    >
                      Experience
                    </p>

                    <p
                      className={`mt-1 font-medium ${heading}`}
                    >
                      {formatExperienceRange(
                        job
                      )}
                    </p>
                  </div>

                  <div>
                    <p
                      className={`text-[11px] uppercase tracking-[0.2em] ${soft}`}
                    >
                      Salary
                    </p>

                    <p
                      className={`mt-1 font-medium ${heading}`}
                    >
                      {formatSalaryRange(job)}
                    </p>
                  </div>

                  <div>
                    <p
                      className={`text-[11px] uppercase tracking-[0.2em] ${soft}`}
                    >
                      Created
                    </p>

                    <p
                      className={`mt-1 font-medium ${heading}`}
                    >
                      {formatDate(
                        job.createdAt ||
                          job.created_at
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}