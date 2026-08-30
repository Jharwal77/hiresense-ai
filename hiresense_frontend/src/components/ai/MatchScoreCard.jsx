export default function MatchScoreCard({ isDark, score, label = 'AI Match' }) {
  const panel = isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-white';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const text = isDark ? 'text-white' : 'text-slate-900';

  const numericScore = Number(score);
  const safeScore = Number.isFinite(numericScore) ? Math.min(100, Math.max(0, numericScore)) : null;

  return (
    <div className={`rounded-2xl border p-5 ${panel}`}>
      <p className={`text-xs uppercase tracking-[0.2em] ${muted}`}>{label}</p>
      <div className="mt-4 flex items-end gap-3">
        <span className={`text-4xl font-bold ${text}`}>{safeScore !== null ? `${safeScore}%` : 'N/A'}</span>
      </div>
      {safeScore !== null ? (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
            style={{ width: `${safeScore}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
