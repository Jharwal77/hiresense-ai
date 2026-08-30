import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AIProcessingState from '../components/ai/AIProcessingState';
import MatchScoreCard from '../components/ai/MatchScoreCard';
import { getCandidateApplications, getExistingJobMatch, getInterviewQuestions } from '../services/candidateAiApi';

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

export default function CandidateApplicationDetailPage({ isDark }) {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [match, setMatch] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadApplication = async () => {
      try {
        const applications = await getCandidateApplications();
        if (!active) return;
        const found = applications.find((item) => Number(item.id) === Number(id));
        setApplication(found || null);

        if (!found) {
          setError('Application not found.');
          return;
        }

        setMatchLoading(true);
        const [jobMatch, interviewQuestions] = await Promise.all([
          getExistingJobMatch(found.jobId).catch(() => null),
          getInterviewQuestions(found.jobId).catch(() => [])
        ]);

        if (!active) return;
        setMatch(jobMatch);
        setQuestions(Array.isArray(interviewQuestions) ? interviewQuestions : []);
      } catch (requestError) {
        if (!active) return;
        setError(requestError?.response?.data?.message || 'Unable to load this application.');
      } finally {
        if (active) setLoading(false);
        if (active) setMatchLoading(false);
      }
    };

    loadApplication();
    return () => { active = false; };
  }, [id]);

  const panel = isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const text = isDark ? 'text-slate-200' : 'text-slate-700';
  const heading = isDark ? 'text-white' : 'text-slate-900';
  const internal = isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-slate-50';

  const statusText = useMemo(() => String(application?.status || 'Applied').replace(/^./, (char) => char.toUpperCase()), [application]);

  if (loading) {
    return <div className={`rounded-2xl border p-6 ${panel}`}>Loading application…</div>;
  }

  if (error || !application) {
    return (
      <div className={`rounded-2xl border p-6 ${panel}`}>
        <p className={`text-lg font-semibold ${heading}`}>{error || 'Application not found.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/candidate/applications" className={isDark ? 'inline-flex rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200' : 'inline-flex rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700'}>
        ← Back to applications
      </Link>

      <div className={`rounded-3xl border p-6 ${panel}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className={isDark ? 'text-sm uppercase tracking-[0.2em] text-sky-300' : 'text-sm uppercase tracking-[0.2em] text-sky-700'}>Application</p>
            <h2 className={`mt-2 text-3xl font-bold ${heading}`}>{application.job?.title || 'Job application'}</h2>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${internal} ${text}`}>{statusText}</span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className={`rounded-2xl border p-4 ${internal}`}>
            <p className={`text-xs uppercase tracking-[0.2em] ${muted}`}>Company</p>
            <p className={`mt-2 text-lg font-semibold ${heading}`}>{application.company?.name || 'Company not specified'}</p>
          </div>
          <div className={`rounded-2xl border p-4 ${internal}`}>
            <p className={`text-xs uppercase tracking-[0.2em] ${muted}`}>Location</p>
            <p className={`mt-2 text-lg font-semibold ${heading}`}>{application.job?.location || 'Remote'}</p>
          </div>
          <div className={`rounded-2xl border p-4 ${internal}`}>
            <p className={`text-xs uppercase tracking-[0.2em] ${muted}`}>Applied date</p>
            <p className={`mt-2 text-lg font-semibold ${heading}`}>{formatDate(application.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {matchLoading ? (
            <AIProcessingState isDark={isDark} label="Analyzing your application match" />
          ) : match ? (
            <div className={`rounded-3xl border p-6 ${panel}`}>
              <div className="flex items-center justify-between gap-3">
                <h3 className={`text-xl font-semibold ${heading}`}>AI Match</h3>
                <MatchScoreCard isDark={isDark} score={match.matchScore ?? match.score ?? null} />
              </div>

              <p className={`mt-4 text-sm ${text}`}>{match.reasoning || 'No detailed reasoning is available from the backend yet.'}</p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className={`rounded-2xl border p-4 ${internal}`}>
                  <p className={`mb-2 text-sm font-semibold ${heading}`}>Strengths</p>
                  {Array.isArray(match.strengths) && match.strengths.length ? (
                    <ul className="space-y-2 text-sm text-sky-400">
                      {match.strengths.map((item) => <li key={item}>✓ {item}</li>)}
                    </ul>
                  ) : (
                    <p className={muted}>No strength data available from the backend.</p>
                  )}
                </div>

                <div className={`rounded-2xl border p-4 ${internal}`}>
                  <p className={`mb-2 text-sm font-semibold ${heading}`}>Skill gaps</p>
                  {Array.isArray(match.gaps) && match.gaps.length ? (
                    <ul className="space-y-2 text-sm text-amber-400">
                      {match.gaps.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                  ) : (
                    <p className={muted}>No skill gap data available from the backend.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`rounded-3xl border p-6 ${panel}`}>
              <h3 className={`text-xl font-semibold ${heading}`}>AI Match</h3>
              <p className={`mt-3 text-sm ${text}`}>AI matching is not available for this application yet.</p>
            </div>
          )}

          <div className={`rounded-3xl border p-6 ${panel}`}>
            <h3 className={`text-xl font-semibold ${heading}`}>Interview Questions</h3>
            {questions.length ? (
              <ol className="mt-4 space-y-4">
                {questions.map((question, index) => (
                  <li key={`${question}-${index}`} className={`rounded-2xl border p-4 ${internal}`}>
                    <p className={`text-xs uppercase tracking-[0.2em] ${muted}`}>Question {String(index + 1).padStart(2, '0')}</p>
                    <p className={`mt-2 text-sm ${text}`}>{question}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className={`mt-3 text-sm ${text}`}>Interview questions will appear after AI analysis is available.</p>
            )}
          </div>
        </div>

        <div className={`rounded-3xl border p-6 ${panel}`}>
          <h3 className={`text-xl font-semibold ${heading}`}>Role summary</h3>
          <div className="mt-4 space-y-3 text-sm">
            <p className={text}>Role: {application.job?.title || 'Role'}</p>
            <p className={text}>Location: {application.job?.location || 'Remote'}</p>
            <p className={text}>Status: {statusText}</p>
            <p className={text}>Applied: {formatDate(application.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
