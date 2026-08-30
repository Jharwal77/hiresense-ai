import { useEffect, useState } from 'react';
import EmployerNav from '../components/employer/EmployerNav';
import { createCompany, getMyCompany, updateMyCompany } from '../services/companyApi';

const emptyForm = {
  name: '',
  description: '',
  website: '',
  location: ''
};

const getFriendlyErrorMessage = (error) => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error?.message;

  if (status === 401 || status === 403) {
    return 'Your session has expired. Please log in again.';
  }

  if (status === 404) {
    return 'Company profile not found. You can create one below.';
  }

  if (status === 409) {
    return 'A company profile already exists for this employer.';
  }

  if (status === 422) {
    return 'Please check the company details and try again.';
  }

  if (status === 500) {
    return 'We could not save the company profile right now. Please try again.';
  }

  if (message) {
    return message;
  }

  return 'Unable to load your company profile. Please try again.';
};

export default function EmployerCompanyPage({ isDark }) {
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    let active = true;

    const loadCompany = async () => {
      setLoading(true);
      setError('');

      try {
        const nextCompany = await getMyCompany();
        if (!active) return;
        setCompany(nextCompany);
        setForm({
          name: nextCompany?.name || '',
          description: nextCompany?.description || '',
          website: nextCompany?.website || '',
          location: nextCompany?.location || ''
        });
      } catch (requestError) {
        if (!active) return;

        if (requestError?.response?.status === 404) {
          setCompany(null);
          setForm(emptyForm);
          return;
        }

        setError(getFriendlyErrorMessage(requestError));
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCompany();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(timeout);
  }, [toast]);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openCreateForm = () => {
    setIsEditing(true);
    setError('');
    setForm(emptyForm);
  };

  const startEdit = () => {
    setIsEditing(true);
    setError('');
    setForm({
      name: company?.name || '',
      description: company?.description || '',
      website: company?.website || '',
      location: company?.location || ''
    });
  };

  const resetView = () => {
    setIsEditing(false);
    setError('');
    setForm({
      name: company?.name || '',
      description: company?.description || '',
      website: company?.website || '',
      location: company?.location || ''
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setError('Company name is required.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: trimmedName,
        description: form.description.trim(),
        website: form.website.trim(),
        location: form.location.trim()
      };

      const nextCompany = company
        ? await updateMyCompany(payload)
        : await createCompany(payload);

      setCompany(nextCompany);
      setIsEditing(false);
      setToast(company ? 'Company profile updated successfully.' : 'Company profile created successfully.');
      setForm({
        name: nextCompany?.name || '',
        description: nextCompany?.description || '',
        website: nextCompany?.website || '',
        location: nextCompany?.location || ''
      });
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
  const soft = isDark ? 'text-slate-400' : 'text-slate-500';
  const primaryButton = isDark ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800';
  const secondaryButton = isDark ? 'border border-slate-700 bg-slate-950 text-slate-100 hover:border-slate-500' : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300';

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className={isDark ? 'text-sm uppercase tracking-[0.2em] text-sky-300' : 'text-sm uppercase tracking-[0.2em] text-sky-700'}>Company</p>
          <h2 className={`mt-2 text-3xl font-bold ${heading}`}>Company profile</h2>
        </div>

        {!loading && !isEditing && company ? (
          <button type="button" onClick={startEdit} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${primaryButton}`}>
            Edit Company
          </button>
        ) : null}
      </div>

      <EmployerNav isDark={isDark} />

      {toast ? (
        <div className={`rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>
          {toast}
        </div>
      ) : null}

      {error ? (
        <div className={`rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm ${isDark ? 'text-red-200' : 'text-red-700'}`}>
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className={`rounded-3xl border p-5 ${panel}`}>
          <div className="space-y-4 animate-pulse">
            <div className={`h-4 w-28 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className={`h-8 w-44 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className={`h-24 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className={`h-12 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
              <div className={`h-12 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            </div>
          </div>
        </div>
      ) : isEditing ? (
        <form onSubmit={handleSubmit} className={`rounded-3xl border p-5 ${panel}`}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className={`block text-sm ${text}`}>
              <span className="mb-2 block">Company name</span>
              <input type="text" value={form.name} onChange={(event) => handleChange('name', event.target.value)} className={inputClass} placeholder="HireSense AI" />
            </label>

            <label className={`block text-sm ${text}`}>
              <span className="mb-2 block">Location</span>
              <input type="text" value={form.location} onChange={(event) => handleChange('location', event.target.value)} className={inputClass} placeholder="Bengaluru, India" />
            </label>
          </div>

          <label className={`mt-5 block text-sm ${text}`}>
            <span className="mb-2 block">Description</span>
            <textarea value={form.description} onChange={(event) => handleChange('description', event.target.value)} className={`${inputClass} min-h-[120px] resize-none`} placeholder="Describe your company and hiring focus." />
          </label>

          <label className={`mt-5 block text-sm ${text}`}>
            <span className="mb-2 block">Website</span>
            <input type="url" value={form.website} onChange={(event) => handleChange('website', event.target.value)} className={inputClass} placeholder="https://example.com" />
          </label>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={resetView} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${secondaryButton}`}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${primaryButton} disabled:cursor-not-allowed disabled:opacity-70`}>
              {saving ? 'Saving...' : company ? 'Save Changes' : 'Create Company Profile'}
            </button>
          </div>
        </form>
      ) : company ? (
        <div className={`rounded-3xl border p-5 ${panel}`}>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${isDark ? 'border-sky-500/30 bg-sky-500/10 text-sky-300' : 'border-sky-200 bg-sky-50 text-sky-700'}`}>
                Company profile
              </div>
              <h3 className={`mt-4 text-3xl font-bold ${heading}`}>{company.name || 'Company name'}</h3>
              <p className={`mt-3 text-base leading-7 ${text}`}>
                {company.description || 'No company description has been added yet.'}
              </p>
            </div>

            <div className={`rounded-2xl border p-4 ${subtle}`}>
              <div className="space-y-4">
                <div>
                  <p className={`text-[11px] uppercase tracking-[0.2em] ${soft}`}>Website</p>
                  <p className={`mt-2 font-medium ${heading}`}>
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noreferrer" className={isDark ? 'text-sky-300 hover:text-sky-200' : 'text-sky-700 hover:text-sky-800'}>
                        {company.website}
                      </a>
                    ) : (
                      'Not specified'
                    )}
                  </p>
                </div>

                <div>
                  <p className={`text-[11px] uppercase tracking-[0.2em] ${soft}`}>Location</p>
                  <p className={`mt-2 font-medium ${heading}`}>{company.location || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`rounded-3xl border border-dashed p-8 text-center ${panel}`}>
          <p className={`text-2xl font-bold ${heading}`}>Create your company profile</p>
          <p className={`mt-3 text-sm ${text}`}>
            Add your company details so candidates can understand your brand, location, and hiring focus.
          </p>
          <button type="button" onClick={openCreateForm} className={`mt-6 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${primaryButton}`}>
            Create Company Profile
          </button>
        </div>
      )}
    </div>
  );
}
