import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Register({ isDark = true }) {
  const navigate = useNavigate();
  const { register, login, user } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    if (user.role === 'employer') {
      return (
        <Navigate
          to="/employer/dashboard"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/candidate/dashboard"
        replace
      />
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      setError(
        'Name, email and password are required.'
      );
      return;
    }

    if (form.password.length < 8) {
      setError(
        'Password must be at least 8 characters.'
      );
      return;
    }

    try {
      setLoading(true);

      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role
      });

      const loginResponse = await login({
        email: form.email.trim(),
        password: form.password
      });

      const registeredUser =
        loginResponse?.data?.user;

      if (!registeredUser) {
        navigate('/login', {
          replace: true
        });
        return;
      }

      if (registeredUser.role === 'employer') {
        navigate(
          '/employer/dashboard',
          {
            replace: true
          }
        );

        return;
      }

      navigate(
        '/candidate/dashboard',
        {
          replace: true
        }
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = isDark
    ? 'w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20'
    : 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20';

  const labelClass = isDark
    ? 'mb-2 block text-sm font-medium text-slate-200'
    : 'mb-2 block text-sm font-medium text-slate-700';

  return (
    <div
      className={`flex min-h-screen items-center justify-center px-4 py-12 ${
        isDark
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div
        className={`w-full max-w-md rounded-3xl border p-8 shadow-2xl ${
          isDark
            ? 'border-slate-800 bg-slate-900/80'
            : 'border-slate-200 bg-white'
        }`}
      >
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-sky-400 transition hover:text-sky-300"
        >
          ← Back to home
        </Link>

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">
            Get started
          </p>

          <h1 className="text-3xl font-bold">
            Create your account
          </h1>

          <p
            className={`mt-3 text-sm ${
              isDark
                ? 'text-slate-400'
                : 'text-slate-600'
            }`}
          >
            Join HireSense and start building a better hiring experience.
          </p>
        </div>

        {error && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              isDark
                ? 'border-red-900/60 bg-red-950/40 text-red-300'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="name"
              className={labelClass}
            >
              Full name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              className={inputClass}
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className={labelClass}
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              className={inputClass}
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className={labelClass}
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              className={inputClass}
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className={labelClass}
            >
              I want to join as
            </label>

            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className={inputClass}
              disabled={loading}
            >
              <option value="candidate">
                Candidate
              </option>

              <option value="employer">
                Employer
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? 'Creating account...'
              : 'Create account'}
          </button>
        </form>

        <p
          className={`mt-6 text-center text-sm ${
            isDark
              ? 'text-slate-400'
              : 'text-slate-600'
          }`}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-sky-400 hover:text-sky-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}