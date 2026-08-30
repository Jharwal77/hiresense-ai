const formatSalary = (salaryMin, salaryMax) => {
  const minValue = Number(salaryMin);
  const maxValue = Number(salaryMax);
  const hasMin = Number.isFinite(minValue) && minValue > 0;
  const hasMax = Number.isFinite(maxValue) && maxValue > 0;

  if (!hasMin && !hasMax) return 'Salary not specified';

  const toLpa = (value) => {
    if (!Number.isFinite(value) || value <= 0) return null;
    const lakh = value / 100000;
    return Number.isInteger(lakh) ? lakh : Number(lakh.toFixed(1));
  };

  const minDisplay = toLpa(minValue);
  const maxDisplay = toLpa(maxValue);

  if (hasMin && hasMax) return `₹${minDisplay} LPA – ₹${maxDisplay} LPA`;
  if (hasMin) return `₹${minDisplay} LPA+`;
  return `Up to ₹${maxDisplay} LPA`;
};

const formatExperience = (experienceMin, experienceMax) => {
  const minValue = Number(experienceMin);
  const maxValue = Number(experienceMax);
  const hasMin = Number.isFinite(minValue) && minValue > 0;
  const hasMax = Number.isFinite(maxValue) && maxValue > 0;

  if (!hasMin && !hasMax) return 'Not specified';

  if (hasMin && hasMax) {
    if (minValue === 0 && maxValue === 1) return '0–1 years';
    if (minValue === 1 && maxValue === 3) return '1–3 years';
    if (minValue === 3 && maxValue === 5) return '3–5 years';
    if (minValue > maxValue) return `${minValue}+ years`;
    return `${minValue}–${maxValue} years`;
  }

  if (hasMin) {
    if (minValue >= 5) return '5+ years';
    return `${minValue}+ years`;
  }

  if (hasMax) return `${maxValue} years`;
  return 'Not specified';
};

const normalizeRoleLevel = (value) => {
  if (!value || String(value).trim().toLowerCase() === 'not specified' || String(value).trim().toLowerCase() === 'null') return 'Not specified';
  const raw = String(value).trim().toLowerCase().replace(/_/g, '-');
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

const normalizeEmploymentType = (value) => {
  if (!value || String(value).trim().toLowerCase() === 'not specified' || String(value).trim().toLowerCase() === 'null') return 'Not specified';
  const raw = String(value).trim().toLowerCase().replace(/_/g, '-');
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

const getCompanyName = (job) => {
  const value = job?.company || job?.companyName || job?.employerName;
  if (value && String(value).trim() !== 'undefined' && String(value).trim() !== 'null') {
    return value;
  }
  return job?.isExternal ? 'Adzuna Job' : 'HireSense Job';
};

const getSourceLabel = (job) => {
  if (job?.source) {
    const value = String(job.source).trim().toLowerCase();
    if (value === 'adzuna') return 'Adzuna';
    if (value === 'hiresense') return 'HireSense';
  }
  return job?.isExternal ? 'Adzuna' : 'HireSense';
};

const formatPostedDate = (value) => {
  if (!value) return 'Recently posted';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently posted';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

export default function JobCard({ job, isDark, onApply }) {
  const textBase = isDark ? 'text-slate-300' : 'text-slate-600';
  const titleColor = isDark ? 'text-white' : 'text-slate-900';
  const cardClass = isDark ? 'border-slate-700 bg-slate-950 hover:border-slate-600' : 'border-slate-200 bg-white hover:border-slate-300';
  const badgeClass = isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600';
  const sourceClass = isDark ? 'bg-sky-500/10 text-sky-300 border border-sky-400/20' : 'bg-sky-50 text-sky-700 border border-sky-200';

  return (
    <article className={`rounded-2xl border p-6 shadow-sm transition duration-200 hover:-translate-y-1 ${cardClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={isDark ? 'text-sm text-sky-300' : 'text-sm text-sky-700'}>{getCompanyName(job)}</p>
          <h3 className={`mt-2 text-2xl font-semibold ${titleColor}`}>{job.title || 'Untitled role'}</h3>
        </div>
        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${sourceClass}`}>{getSourceLabel(job)}</span>
      </div>

      <div className={`mt-4 flex flex-wrap gap-2 text-sm ${textBase}`}>
        <span className={`rounded-full px-2.5 py-1 ${badgeClass}`}>{normalizeRoleLevel(job.roleLevel)}</span>
        <span className={`rounded-full px-2.5 py-1 ${badgeClass}`}>{job.location || 'Remote'}</span>
        <span className={`rounded-full px-2.5 py-1 ${badgeClass}`}>{formatExperience(job.experienceMin, job.experienceMax)}</span>
      </div>

      <div className={`mt-4 flex flex-wrap gap-2 text-sm ${textBase}`}>
        <span className={`rounded-full px-2.5 py-1 ${badgeClass}`}>{normalizeEmploymentType(job.employmentType)}</span>
        <span className={`rounded-full px-2.5 py-1 ${badgeClass}`}>{formatSalary(job.salaryMin, job.salaryMax)}</span>
      </div>

      <p className={`mt-4 line-clamp-3 ${textBase}`}>{job.description || 'No description provided.'}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(job.requiredSkills || []).slice(0, 4).map((skill) => (
          <span key={skill} className={isDark ? 'rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-200' : 'rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-700'}>{skill}</span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 text-sm">
        <div className={isDark ? 'text-slate-400' : 'text-slate-500'}>{formatPostedDate(job.createdAt)}</div>
        <button
          type="button"
          onClick={() => onApply?.(job)}
          className={isDark ? 'rounded-lg bg-white px-3 py-2 font-medium text-slate-900 hover:bg-slate-200' : 'rounded-lg bg-slate-900 px-3 py-2 font-medium text-white hover:bg-slate-800'}
        >
          {job.isExternal ? 'Apply on Adzuna' : 'Apply Now'}
        </button>
      </div>
    </article>
  );
}
