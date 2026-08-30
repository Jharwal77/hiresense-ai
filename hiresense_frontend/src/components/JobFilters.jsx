export default function JobFilters({ filters, setFilters, isDark, onClear }) {
  const fieldClass = isDark ? 'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-400' : 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-400';
  const labelClass = isDark ? 'mb-2 block text-sm text-slate-300' : 'mb-2 block text-sm text-slate-700';
  const panelClass = isDark ? 'rounded-2xl border border-slate-700 bg-slate-900 p-5' : 'rounded-2xl border border-slate-200 bg-white p-5';
  const buttonClass = isDark ? 'rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:border-slate-500' : 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-slate-300';

  const update = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  return (
    <div className={`${panelClass} space-y-4`}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="xl:col-span-2">
          <label className={labelClass}>Search</label>
          <input value={filters.search || ''} onChange={(event) => update('search', event.target.value)} placeholder="Search jobs..." className={fieldClass} />
        </div>

        <div>
          <label className={labelClass}>Location</label>
          <select value={filters.location || ''} onChange={(event) => update('location', event.target.value)} className={fieldClass}>
            <option value="">All locations</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
            <option value="Chennai">Chennai</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Role level</label>
          <select value={filters.roleLevel || ''} onChange={(event) => update('roleLevel', event.target.value)} className={fieldClass}>
            <option value="">All Levels</option>
            <option value="internship">Internship</option>
            <option value="entry-level">Entry Level</option>
            <option value="junior">Junior</option>
            <option value="mid-level">Mid Level</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Job type</label>
          <select value={filters.employmentType || ''} onChange={(event) => update('employmentType', event.target.value)} className={fieldClass}>
            <option value="">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="freelance">Freelance</option>
            <option value="temporary">Temporary</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Source</label>
          <select value={filters.source || ''} onChange={(event) => update('source', event.target.value)} className={fieldClass}>
            <option value="">All Jobs</option>
            <option value="hiresense">HireSense</option>
            <option value="adzuna">Adzuna</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Min experience</label>
          <input value={filters.minExperience || ''} onChange={(event) => update('minExperience', event.target.value)} type="number" min="0" placeholder="Min experience" className={fieldClass} />
        </div>

        <div>
          <label className={labelClass}>Max experience</label>
          <input value={filters.maxExperience || ''} onChange={(event) => update('maxExperience', event.target.value)} type="number" min="0" placeholder="Max experience" className={fieldClass} />
        </div>

        <div>
          <label className={labelClass}>Min salary</label>
          <input value={filters.minSalary || ''} onChange={(event) => update('minSalary', event.target.value)} type="number" min="0" placeholder="Min salary" className={fieldClass} />
        </div>

        <div>
          <label className={labelClass}>Max salary</label>
          <input value={filters.maxSalary || ''} onChange={(event) => update('maxSalary', event.target.value)} type="number" min="0" placeholder="Max salary" className={fieldClass} />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={onClear} className={buttonClass}>Clear all filters</button>
      </div>
    </div>
  );
}
