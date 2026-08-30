import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import JobCard from '../components/JobCard';
import JobFilters from '../components/JobFilters';
import Pagination from '../components/Pagination';
import { applyToJob, getJobs } from '../services/jobApi';

const EMPTY_FILTERS = {
  search: '',
  location: '',
  roleLevel: '',
  employmentType: '',
  source: '',
  minSalary: '',
  maxSalary: '',
  minExperience: '',
  maxExperience: '',
  page: 1
};

function JobsSkeleton({ isDark }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse rounded-2xl border p-6 ${
            isDark
              ? 'border-slate-700 bg-slate-900'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div
            className={`h-4 w-20 rounded ${
              isDark ? 'bg-slate-700' : 'bg-slate-200'
            }`}
          />

          <div
            className={`mt-4 h-7 w-2/3 rounded ${
              isDark ? 'bg-slate-700' : 'bg-slate-200'
            }`}
          />

          <div className="mt-5 flex flex-wrap gap-2">
            <div
              className={`h-6 w-20 rounded-full ${
                isDark ? 'bg-slate-700' : 'bg-slate-200'
              }`}
            />

            <div
              className={`h-6 w-24 rounded-full ${
                isDark ? 'bg-slate-700' : 'bg-slate-200'
              }`}
            />

            <div
              className={`h-6 w-28 rounded-full ${
                isDark ? 'bg-slate-700' : 'bg-slate-200'
              }`}
            />
          </div>

          <div
            className={`mt-5 h-20 rounded ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}
          />

          <div className="mt-5 flex flex-wrap gap-2">
            <div
              className={`h-6 w-16 rounded-full ${
                isDark ? 'bg-slate-700' : 'bg-slate-200'
              }`}
            />

            <div
              className={`h-6 w-20 rounded-full ${
                isDark ? 'bg-slate-700' : 'bg-slate-200'
              }`}
            />

            <div
              className={`h-6 w-24 rounded-full ${
                isDark ? 'bg-slate-700' : 'bg-slate-200'
              }`}
            />

            <div
              className={`h-6 w-18 rounded-full ${
                isDark ? 'bg-slate-700' : 'bg-slate-200'
              }`}
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div
              className={`h-4 w-24 rounded ${
                isDark ? 'bg-slate-700' : 'bg-slate-200'
              }`}
            />

            <div
              className={`h-10 w-28 rounded-lg ${
                isDark ? 'bg-slate-700' : 'bg-slate-200'
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function JobsError({
  message,
  isDark,
  onRetry
}) {
  return (
    <div
      className={`rounded-2xl border border-red-500/30 bg-red-500/10 p-5 ${
        isDark ? 'text-red-200' : 'text-red-700'
      }`}
    >
      <p className="font-medium">
        {message || 'Unable to load jobs'}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className={
          isDark
            ? 'mt-3 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm'
            : 'mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm'
        }
      >
        Try Again
      </button>
    </div>
  );
}

function JobsEmptyState({
  isDark,
  pageClass,
  headingClass,
  onClear
}) {
  return (
    <div
      className={`rounded-2xl border p-8 text-center ${pageClass}`}
    >
      <h3
        className={`text-xl font-semibold ${headingClass}`}
      >
        No jobs found
      </h3>

      <p
        className={`mt-2 ${
          isDark
            ? 'text-slate-400'
            : 'text-slate-600'
        }`}
      >
        Try changing your filters or search.
      </p>

      <button
        type="button"
        onClick={onClear}
        className={
          isDark
            ? 'mt-4 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm'
            : 'mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm'
        }
      >
        Clear filters
      </button>
    </div>
  );
}

export default function JobsPage({ isDark }) {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const initialFilters = {
    ...EMPTY_FILTERS,
    search:
      searchParams.get('search') || '',
    location:
      searchParams.get('location') || '',
    roleLevel:
      searchParams.get('roleLevel') || '',
    employmentType:
      searchParams.get('employmentType') || '',
    source:
      searchParams.get('source') || '',
    minSalary:
      searchParams.get('minSalary') || '',
    maxSalary:
      searchParams.get('maxSalary') || '',
    minExperience:
      searchParams.get('minExperience') || '',
    maxExperience:
      searchParams.get('maxExperience') || '',
    page:
      Number(searchParams.get('page')) || 1
  };

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1
    });

  const [filters, setFilters] =
    useState(initialFilters);

  const [searchText, setSearchText] =
    useState(initialFilters.search);

  const fetchRequestIdRef = useRef(0);
  const abortControllerRef = useRef(null);

  /*
   * Debounce the search input.
   *
   * This prevents an API request on every
   * individual keyboard character.
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters((previous) => ({
        ...previous,
        search: searchText.trim(),
        page: 1
      }));
    }, 400);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchText]);

  /*
   * Load jobs whenever the actual filters change.
   */
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller =
      new AbortController();

    abortControllerRef.current =
      controller;

    const currentRequestId =
      ++fetchRequestIdRef.current;

    const params = {
      ...(filters.search
        ? {
            search:
              filters.search.trim()
          }
        : {}),

      ...(filters.location
        ? {
            location:
              filters.location
          }
        : {}),

      ...(filters.roleLevel
        ? {
            roleLevel:
              filters.roleLevel
          }
        : {}),

      ...(filters.employmentType
        ? {
            employmentType:
              filters.employmentType
          }
        : {}),

      ...(filters.source
        ? {
            source:
              filters.source
          }
        : {}),

      ...(filters.minSalary
        ? {
            minSalary:
              Number(filters.minSalary)
          }
        : {}),

      ...(filters.maxSalary
        ? {
            maxSalary:
              Number(filters.maxSalary)
          }
        : {}),

      ...(filters.minExperience
        ? {
            minExperience:
              Number(
                filters.minExperience
              )
          }
        : {}),

      ...(filters.maxExperience
        ? {
            maxExperience:
              Number(
                filters.maxExperience
              )
          }
        : {}),

      page:
        Number(filters.page) || 1,

      limit: 20
    };

    const nextUrl =
      new URLSearchParams();

    Object.entries(params).forEach(
      ([key, value]) => {
        if (
          value === '' ||
          value === null ||
          value === undefined
        ) {
          return;
        }

        if (
          String(value).trim() === ''
        ) {
          return;
        }

        nextUrl.set(
          key,
          String(value)
        );
      }
    );

    setSearchParams(
      nextUrl,
      { replace: true }
    );

    /*
     * Keep the async request inside the effect.
     * The state updates happen after the
     * external API operation completes.
     */
    const loadJobs = async () => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await getJobs(
            params,
            controller.signal
          );

        if (
          currentRequestId !==
          fetchRequestIdRef.current
        ) {
          return;
        }

        const nextJobs =
          Array.isArray(
            result?.jobs
          )
            ? result.jobs
            : [];

        const nextPagination =
          result?.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 1
          };

        setJobs(nextJobs);
        setPagination(
          nextPagination
        );
      } catch (requestError) {
        if (
          currentRequestId !==
          fetchRequestIdRef.current
        ) {
          return;
        }

        if (
          requestError?.code ===
            'ERR_CANCELED' ||
          requestError?.name ===
            'CanceledError' ||
          requestError?.name ===
            'AbortError'
        ) {
          return;
        }

        setError(
          'Unable to load jobs'
        );
      } finally {
        if (
          currentRequestId ===
          fetchRequestIdRef.current
        ) {
          setLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      controller.abort();
    };
  }, [
    filters,
    setSearchParams
  ]);

  const clearFilters = () => {
    setSearchText('');

    setFilters({
      ...EMPTY_FILTERS,
      page: 1
    });
  };

  const handlePageChange = (
    nextPage
  ) => {
    if (
      nextPage < 1 ||
      nextPage >
        pagination.totalPages
    ) {
      return;
    }

    setFilters(
      (previous) => ({
        ...previous,
        page: nextPage
      })
    );
  };

  const handleApply = async (
    job
  ) => {
    if (!job) {
      return;
    }

    /*
     * External jobs are opened
     * on their original source.
     */
    if (job.isExternal) {
      window.open(
        job.externalUrl,
        '_blank',
        'noopener,noreferrer'
      );

      return;
    }

    try {
      await applyToJob(job.id);

      window.alert(
        'Application submitted successfully.'
      );
    } catch (requestError) {
      const message =
        requestError?.response
          ?.status === 409
          ? 'You have already applied to this job.'
          : requestError
              ?.response?.data
              ?.message ||
            'Failed to apply for this job.';

      window.alert(message);
    }
  };

  const headingClass = isDark
    ? 'text-white'
    : 'text-slate-900';

  const subClass = isDark
    ? 'text-sky-300'
    : 'text-sky-700';

  const pageClass = isDark
    ? 'border-slate-800 bg-slate-900 text-slate-300'
    : 'border-slate-200 bg-white text-slate-600';

  return (
    <div className="space-y-6">
      <div>
        <p
          className={`text-sm uppercase tracking-[0.2em] ${subClass}`}
        >
          Open roles
        </p>

        <h2
          className={`mt-2 text-3xl font-bold ${headingClass}`}
        >
          Find your next opportunity
        </h2>
      </div>

      <JobFilters
        filters={{
          ...filters,
          search: searchText
        }}
        setFilters={(updater) => {
          const nextValue =
            typeof updater === 'function'
              ? updater(filters)
              : {
                  ...filters,
                  ...updater
                };

          setFilters(nextValue);

          if (
            Object.prototype.hasOwnProperty.call(
              nextValue,
              'search'
            )
          ) {
            setSearchText(
              nextValue.search || ''
            );
          }
        }}
        isDark={isDark}
        onClear={clearFilters}
      />

      {loading && (
        <JobsSkeleton
          isDark={isDark}
        />
      )}

      {!loading && error && (
        <JobsError
          message={error}
          isDark={isDark}
          onRetry={() =>
            setFilters(
              (previous) => ({
                ...previous,
                page: 1
              })
            )
          }
        />
      )}

      {!loading &&
        !error &&
        jobs.length === 0 && (
          <JobsEmptyState
            isDark={isDark}
            pageClass={pageClass}
            headingClass={
              headingClass
            }
            onClear={
              clearFilters
            }
          />
        )}

      {!loading &&
        !error &&
        jobs.length > 0 && (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isDark={isDark}
                  onApply={
                    handleApply
                  }
                />
              ))}
            </div>

            <Pagination
              page={
                pagination.page ||
                1
              }
              totalPages={
                pagination.totalPages ||
                1
              }
              onPageChange={
                handlePageChange
              }
              isDark={isDark}
            />
          </>
        )}
    </div>
  );
}