import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCandidateApplications } from '../services/candidateAiApi';

const formatDate = (value) => {
  if (!value) return 'Recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export default function CandidateApplicationsPage({ isDark }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadApplications = async () => {
      try {
        const nextApplications = await getCandidateApplications();
        if (!active) return;
        setApplications(Array.isArray(nextApplications) ? nextApplications : []);
      } catch (requestError) {
        if (!active) return;
        setError(requestError?.response?.data?.message || 'Unable to load your applications right now.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadApplications();
    return () => { active = false; };
  }, []);

  const panel = isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white';
  const border = isDark ? 'border-slate-700' : 'border-slate-200';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const heading = isDark ? 'text-white' : 'text-slate-900';
  const text = isDark ? 'text-slate-300' : 'text-slate-600';

  return (
    <div className="space-y-6">
      <div>
        <p className={isDark ? 'text-sm uppercase tracking-[0.2em] text-sky-300' : 'text-sm uppercase tracking-[0.2em] text-sky-700'}>Applications</p>
        <h2 className={`mt-2 text-3xl font-bold ${heading}`}>Your recent applications</h2>
      </div>

      {error ? (
        <div className={`rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm ${isDark ? 'text-red-200' : 'text-red-700'}`}>{error}</div>
      ) : null}

      {loading ? (
        <div className={`rounded-2xl border p-6 ${panel}`}>Loading applications…</div>
      ) : applications.length === 0 ? (
        <div className={`rounded-2xl border p-6 ${panel}`}>
          <p className={`text-lg font-semibold ${heading}`}>You haven&apos;t applied to any jobs yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application.id} className={`rounded-3xl border p-5 ${panel}`}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-xl font-semibold ${heading}`}>{application.job?.title || 'Job application'}</p>
                  <p className={`mt-1 text-sm ${muted}`}>{application.company?.name || 'Company'} • {application.job?.location || 'Remote'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${border} ${text}`}>
                    {String(application.status || 'Applied').toLowerCase() === 'shortlisted' ? 'Shortlisted' : String(application.status || 'Applied').replace(/^./, (char) => char.toUpperCase())}
                  </span>
                  <Link to={`/candidate/applications/${application.id}`} className={isDark ? 'rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 hover:border-slate-500' : 'rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:border-slate-300'}>
                    View details
                  </Link>
                </div>
              </div>
              <div className={`mt-4 text-sm ${text}`}>Applied on {formatDate(application.createdAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
