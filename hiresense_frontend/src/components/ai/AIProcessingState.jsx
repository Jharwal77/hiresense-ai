export default function AIProcessingState({ isDark, label = 'Analyzing your profile' }) {
  const panel = isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-slate-50';
  const text = isDark ? 'text-slate-200' : 'text-slate-700';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`rounded-2xl border p-5 ${panel}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/15 text-sky-400">
          <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-sky-400" />
        </div>
        <div>
          <p className={`text-base font-semibold ${text}`}>{label}</p>
          <p className={`text-sm ${muted}`}>Reviewing your resume against this role</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {[
          'Resume uploaded',
          'Resume text extracted',
          'Comparing skills with job',
          'Generating insights',
          'Preparing interview questions'
        ].map((step, index) => (
          <div key={step} className="flex items-center gap-3 text-sm">
            <span className={index === 2 ? 'text-sky-400' : 'text-slate-400'}>{index < 2 ? '✓' : index === 2 ? '●' : '○'}</span>
            <span className={index === 2 ? (isDark ? 'text-slate-200' : 'text-slate-700') : (isDark ? 'text-slate-400' : 'text-slate-500')}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
