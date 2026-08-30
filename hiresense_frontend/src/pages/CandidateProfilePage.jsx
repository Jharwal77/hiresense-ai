import { useEffect, useState } from 'react';
import { getCandidateProfile, updateCandidateProfile } from '../services/candidateResumeApi';

const defaultEducation = () => ({ institution: '', degree: '', startYear: '', endYear: '' });
const defaultWorkHistory = () => ({ company: '', role: '', startDate: '', endDate: '', description: '' });

const formatListValue = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (!value) return 'Not available yet';
  return String(value);
};

export default function CandidateProfilePage({ isDark }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({
    name: '',
    skills: '',
    experienceYears: '',
    education: [defaultEducation()],
    workHistory: [defaultWorkHistory()]
  });

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const nextProfile = await getCandidateProfile();
        if (!active) return;

        setProfile(nextProfile);
        setForm({
          name: nextProfile?.name || '',
          skills: Array.isArray(nextProfile?.skills) ? nextProfile.skills.filter(Boolean).join(', ') : '',
          experienceYears: nextProfile?.experienceYears ?? nextProfile?.experience_years ?? '',
          education: Array.isArray(nextProfile?.education) && nextProfile.education.length
            ? nextProfile.education.map((entry) => ({
                institution: entry?.institution || '',
                degree: entry?.degree || entry?.field || '',
                startYear: entry?.startYear ?? entry?.start_year ?? '',
                endYear: entry?.endYear ?? entry?.end_year ?? ''
              }))
            : [defaultEducation()],
          workHistory: Array.isArray(nextProfile?.workHistory) && nextProfile.workHistory.length
            ? nextProfile.workHistory.map((entry) => ({
                company: entry?.company || '',
                role: entry?.role || '',
                startDate: entry?.startDate ?? entry?.start_date ?? '',
                endDate: entry?.endDate ?? entry?.end_date ?? '',
                description: entry?.description || ''
              }))
            : [defaultWorkHistory()]
        });
      } catch (requestError) {
        if (!active) return;
        setError(requestError?.response?.data?.message || 'Unable to load your profile right now.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(timeout);
  }, [toast]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateEducationItem = (index, field, value) => {
    setForm((current) => ({
      ...current,
      education: current.education.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    }));
  };

  const updateWorkHistoryItem = (index, field, value) => {
    setForm((current) => ({
      ...current,
      workHistory: current.workHistory.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    }));
  };

  const addEducation = () => setForm((current) => ({ ...current, education: [...current.education, defaultEducation()] }));
  const addWorkHistory = () => setForm((current) => ({ ...current, workHistory: [...current.workHistory, defaultWorkHistory()] }));

  const removeEducation = (index) => {
    setForm((current) => ({
      ...current,
      education: current.education.length > 1 ? current.education.filter((_, itemIndex) => itemIndex !== index) : [defaultEducation()]
    }));
  };

  const removeWorkHistory = (index) => {
    setForm((current) => ({
      ...current,
      workHistory: current.workHistory.length > 1 ? current.workHistory.filter((_, itemIndex) => itemIndex !== index) : [defaultWorkHistory()]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const nextPayload = {
        name: form.name,
        skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean),
        experienceYears: form.experienceYears === '' || form.experienceYears === null || form.experienceYears === undefined ? null : Number(form.experienceYears),
        education: form.education.map((item) => ({
          institution: item.institution || '',
          degree: item.degree || '',
          startYear: item.startYear || null,
          endYear: item.endYear || null
        })),
        workHistory: form.workHistory.map((item) => ({
          company: item.company || '',
          role: item.role || '',
          startDate: item.startDate || null,
          endDate: item.endDate || null,
          description: item.description || ''
        }))
      };

      const updatedProfile = await updateCandidateProfile(nextPayload);
      setProfile(updatedProfile || { ...profile, ...nextPayload });
      setToast('Profile saved successfully.');
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to save your profile right now.');
    } finally {
      setSaving(false);
    }
  };

  const panel = isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white';
  const subtle = isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-slate-50';
  const text = isDark ? 'text-slate-300' : 'text-slate-600';
  const heading = isDark ? 'text-white' : 'text-slate-900';
  const soft = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputClass = isDark ? 'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-sky-400' : 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-sky-400';
  const buttonPrimary = isDark ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800';
  const buttonSecondary = isDark ? 'border border-slate-700 bg-slate-950 text-slate-100 hover:border-slate-500' : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300';

  return (
    <div className="space-y-6">
      <div>
        <p className={isDark ? 'text-sm uppercase tracking-[0.2em] text-sky-300' : 'text-sm uppercase tracking-[0.2em] text-sky-700'}>Profile</p>
        <h2 className={`mt-2 text-3xl font-bold ${heading}`}>Candidate profile</h2>
      </div>

      {error ? <div className={`rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm ${isDark ? 'text-red-200' : 'text-red-700'}`}>{error}</div> : null}
      {toast ? <div className={`rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>{toast}</div> : null}

      {loading ? (
        <div className={`rounded-3xl border p-6 ${panel}`}>Loading profile…</div>
      ) : (
        <div className="space-y-6">
          <div className={`rounded-3xl border p-6 ${panel}`}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className={`block text-sm ${text}`}>
                <span className="mb-2 block">Name</span>
                <input type="text" value={form.name} onChange={(event) => updateField('name', event.target.value)} className={inputClass} />
              </label>
              <label className={`block text-sm ${text}`}>
                <span className="mb-2 block">Experience (years)</span>
                <input type="number" min="0" value={form.experienceYears} onChange={(event) => updateField('experienceYears', event.target.value)} className={inputClass} />
              </label>
            </div>

            <label className={`mt-4 block text-sm ${text}`}>
              <span className="mb-2 block">Skills</span>
              <textarea value={form.skills} onChange={(event) => updateField('skills', event.target.value)} rows={3} className={inputClass} placeholder="React, Node.js, SQL, Product strategy" />
            </label>
          </div>

          <div className={`rounded-3xl border p-6 ${panel}`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className={`text-xl font-semibold ${heading}`}>Education</h3>
              <button type="button" onClick={addEducation} className={`rounded-xl px-3 py-2 text-sm ${buttonSecondary}`}>Add education</button>
            </div>

            <div className="space-y-4">
              {form.education.map((item, index) => (
                <div key={`edu-${index}`} className={`rounded-2xl border p-4 ${subtle}`}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <input value={item.institution} onChange={(event) => updateEducationItem(index, 'institution', event.target.value)} placeholder="Institution" className={inputClass} />
                    <input value={item.degree} onChange={(event) => updateEducationItem(index, 'degree', event.target.value)} placeholder="Degree / field" className={inputClass} />
                    <input value={item.startYear} onChange={(event) => updateEducationItem(index, 'startYear', event.target.value)} placeholder="Start year" className={inputClass} />
                    <input value={item.endYear} onChange={(event) => updateEducationItem(index, 'endYear', event.target.value)} placeholder="End year" className={inputClass} />
                  </div>
                  <div className="mt-3 text-right">
                    <button type="button" onClick={() => removeEducation(index)} className={`rounded-lg px-2.5 py-1.5 text-xs ${buttonSecondary}`}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-3xl border p-6 ${panel}`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className={`text-xl font-semibold ${heading}`}>Work history</h3>
              <button type="button" onClick={addWorkHistory} className={`rounded-xl px-3 py-2 text-sm ${buttonSecondary}`}>Add experience</button>
            </div>

            <div className="space-y-4">
              {form.workHistory.map((item, index) => (
                <div key={`work-${index}`} className={`rounded-2xl border p-4 ${subtle}`}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <input value={item.company} onChange={(event) => updateWorkHistoryItem(index, 'company', event.target.value)} placeholder="Company" className={inputClass} />
                    <input value={item.role} onChange={(event) => updateWorkHistoryItem(index, 'role', event.target.value)} placeholder="Role" className={inputClass} />
                    <input value={item.startDate} onChange={(event) => updateWorkHistoryItem(index, 'startDate', event.target.value)} placeholder="Start date" className={inputClass} />
                    <input value={item.endDate} onChange={(event) => updateWorkHistoryItem(index, 'endDate', event.target.value)} placeholder="End date" className={inputClass} />
                  </div>
                  <textarea value={item.description} onChange={(event) => updateWorkHistoryItem(index, 'description', event.target.value)} rows={3} placeholder="Role summary" className={`${inputClass} mt-4`} />
                  <div className="mt-3 text-right">
                    <button type="button" onClick={() => removeWorkHistory(index)} className={`rounded-lg px-2.5 py-1.5 text-xs ${buttonSecondary}`}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-3xl border p-4 border-sky-500/20 bg-sky-500/5">
            <div>
              <p className={`text-sm font-medium ${heading}`}>Profile preview</p>
              <p className={`text-sm ${soft}`}>{formatListValue(profile?.skills)}</p>
            </div>
            <button type="button" onClick={handleSave} disabled={saving} className={`rounded-xl px-4 py-2 text-sm font-medium ${buttonPrimary} disabled:cursor-not-allowed disabled:opacity-70`}>
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
