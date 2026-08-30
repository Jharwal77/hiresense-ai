import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmployerNav from '../components/employer/EmployerNav';
import { createEmployerJob } from '../services/employerApi';

const allowedRoles = ['intern', 'junior', 'mid', 'senior', 'lead', 'manager'];
const allowedEmploymentTypes = ['full-time', 'part-time', 'contract', 'internship'];

const createEmptyForm = () => ({
  title: '',
  description: '',
  requiredSkills: [],
  skillInput: '',
  experienceMin: '',
  experienceMax: '',
  roleLevel: 'junior',
  location: '',
  employmentType: 'full-time',
  salaryMin: '',
  salaryMax: ''
});

const getFriendlyErrorMessage = (error) => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error?.message;

  if (status === 401 || status === 403) {
    return 'Your session has expired. Please log in again.';
  }

  if (status === 404) {
    return 'This job endpoint is unavailable right now.';
  }

  if (status === 409) {
    return 'A job with those details already exists.';
  }

  if (status === 422) {
    return 'Please check the job details and try again.';
  }

  if (status === 500) {
    return 'We could not create this job right now. Please try again.';
  }

  if (message) {
    return message;
  }

  return 'Unable to create the job. Please try again.';
};

export default function EmployerCreateJobPage({ isDark }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(createEmptyForm());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSkillAdd = () => {
    const value = form.skillInput.trim();
    if (!value) return;
    if (form.requiredSkills.some((skill) => skill.toLowerCase() === value.toLowerCase())) {
      setForm((current) => ({ ...current, skillInput: '' }));
      return;
    }

    setForm((current) => ({
      ...current,
      requiredSkills: [...current.requiredSkills, value],
      skillInput: ''
    }));
  };

  const handleSkillKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSkillAdd();
    }
  };

  const removeSkill = (skill) => {
    setForm((current) => ({
      ...current,
      requiredSkills: current.requiredSkills.filter((item) => item !== skill)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      setError('Job title is required.');
      return;
    }

    if (title.length < 2 || title.length > 255) {
      setError('Job title must be between 2 and 255 characters.');
      return;
    }

    if (!description || description.length < 10) {
      setError('Job description must be at least 10 characters long.');
      return;
    }

    if (!form.requiredSkills.length) {
      setError('Please add at least one required skill.');
      return;
    }

    if (!allowedRoles.includes(form.roleLevel)) {
      setError('Please choose a valid role level.');
      return;
    }

    if (!allowedEmploymentTypes.includes(form.employmentType)) {
      setError('Please choose a valid employment type.');
      return;
    }

    const experienceMin = Number(form.experienceMin);
    const experienceMax = form.experienceMax === '' ? null : Number(form.experienceMax);
    const salaryMin = form.salaryMin === '' ? null : Number(form.salaryMin);
    const salaryMax = form.salaryMax === '' ? null : Number(form.salaryMax);

    if (!Number.isFinite(experienceMin) || experienceMin < 0) {
      setError('Minimum experience must be a valid number.');
      return;
    }

    if (experienceMax !== null && (!Number.isFinite(experienceMax) || experienceMax < experienceMin)) {
      setError('Maximum experience must be greater than or equal to minimum experience.');
      return;
    }

    if (salaryMin !== null && (!Number.isFinite(salaryMin) || salaryMin < 0)) {
      setError('Minimum salary must be zero or greater.');
      return;
    }

    if (salaryMax !== null && (!Number.isFinite(salaryMax) || salaryMax < 0)) {
      setError('Maximum salary must be zero or greater.');
      return;
    }

    if (salaryMin !== null && salaryMax !== null && salaryMax < salaryMin) {
      setError('Maximum salary cannot be lower than minimum salary.');
      return;
    }

    setSaving(true);

    try {
      await createEmployerJob({
        title,
        description,
        requiredSkills: form.requiredSkills,
        experienceMin,
        experienceMax,
        roleLevel: form.roleLevel,
        location: form.location.trim(),
        employmentType: form.employmentType,
        salaryMin,
        salaryMax
      });

      navigate('/employer/jobs', { state: { toast: 'Job created successfully.' } });
    } catch (requestError) {
      setError(getFriendlyErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const panel = isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white';
  const subtle = isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-slate-50';
  const inputClass = isDark
    ? 'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition focus:border-sky-400'
    : 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-sky-400';
  const text = isDark ? 'text-slate-300' : 'text-slate-600';
  const heading = isDark ? 'text-white' : 'text-slate-900';
  const primaryButton = isDark ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800';
  const secondaryButton = isDark ? 'border border-slate-700 bg-slate-950 text-slate-100 hover:border-slate-500' : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300';

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className={isDark ? 'text-sm uppercase tracking-[0.2em] text-sky-300' : 'text-sm uppercase tracking-[0.2em] text-sky-700'}>Post a job</p>
          <h2 className={`mt-2 text-3xl font-bold ${heading}`}>Create a new role</h2>
        </div>

        <Link to="/employer/jobs" className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${secondaryButton}`}>
          Back to jobs
        </Link>
      </div>

      <EmployerNav isDark={isDark} />

      <form onSubmit={handleSubmit} className={`rounded-3xl border p-5 ${panel}`}>
        {error ? (
          <div className={`mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm ${isDark ? 'text-red-200' : 'text-red-700'}`}>
            {error}
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          <label className={`block text-sm ${text}`}>
            <span className="mb-2 block">Job title</span>
            <input type="text" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className={inputClass} placeholder="Senior Product Designer" />
          </label>

          <label className={`block text-sm ${text}`}>
            <span className="mb-2 block">Location</span>
            <input type="text" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} className={inputClass} placeholder="Bengaluru, India" />
          </label>

          <label className={`block text-sm ${text}`}>
            <span className="mb-2 block">Employment type</span>
            <select value={form.employmentType} onChange={(event) => setForm((current) => ({ ...current, employmentType: event.target.value }))} className={inputClass}>
              {allowedEmploymentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>

          <label className={`block text-sm ${text}`}>
            <span className="mb-2 block">Role level</span>
            <select value={form.roleLevel} onChange={(event) => setForm((current) => ({ ...current, roleLevel: event.target.value }))} className={inputClass}>
              {allowedRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </label>

          <label className={`block text-sm ${text}`}>
            <span className="mb-2 block">Minimum experience (years)</span>
            <input type="number" min="0" value={form.experienceMin} onChange={(event) => setForm((current) => ({ ...current, experienceMin: event.target.value }))} className={inputClass} placeholder="2" />
          </label>

          <label className={`block text-sm ${text}`}>
            <span className="mb-2 block">Maximum experience (years)</span>
            <input type="number" min="0" value={form.experienceMax} onChange={(event) => setForm((current) => ({ ...current, experienceMax: event.target.value }))} className={inputClass} placeholder="6" />
          </label>

          <label className={`block text-sm ${text}`}>
            <span className="mb-2 block">Minimum salary (₹)</span>
            <input type="number" min="0" value={form.salaryMin} onChange={(event) => setForm((current) => ({ ...current, salaryMin: event.target.value }))} className={inputClass} placeholder="1200000" />
          </label>

          <label className={`block text-sm ${text}`}>
            <span className="mb-2 block">Maximum salary (₹)</span>
            <input type="number" min="0" value={form.salaryMax} onChange={(event) => setForm((current) => ({ ...current, salaryMax: event.target.value }))} className={inputClass} placeholder="1800000" />
          </label>
        </div>

        <label className={`mt-5 block text-sm ${text}`}>
          <span className="mb-2 block">Job description</span>
          <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={6} className={inputClass} placeholder="Describe the role, responsibilities, and team context." />
        </label>

        <div className={`mt-5 rounded-2xl border p-4 ${subtle}`}>
          <span className={`mb-2 block text-sm ${text}`}>Required skills</span>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input type="text" value={form.skillInput} onChange={(event) => setForm((current) => ({ ...current, skillInput: event.target.value }))} onKeyDown={handleSkillKeyDown} className={inputClass} placeholder="Type a skill and press Enter" />
            <button type="button" onClick={handleSkillAdd} className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${primaryButton}`}>
              Add skill
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {form.requiredSkills.length === 0 ? (
              <span className={`text-sm ${text}`}>No skills added yet.</span>
            ) : (
              form.requiredSkills.map((skill) => (
                <span key={skill} className={isDark ? 'inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-sm text-sky-200' : 'inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-sm text-sky-700'}>
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="text-current opacity-70 hover:opacity-100">×</button>
                </span>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link to="/employer/jobs" className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${secondaryButton}`}>
            Cancel
          </Link>
          <button type="submit" disabled={saving} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${primaryButton}`}>
            {saving ? 'Saving...' : 'Create Job'}
          </button>
        </div>
      </form>
    </div>
  );
}
