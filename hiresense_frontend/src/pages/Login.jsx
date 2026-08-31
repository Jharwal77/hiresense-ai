import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Login({ isDark = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: ''
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

  const getRedirectPath = (userData) => {
    const from = location.state?.from?.pathname;

    if (from) {
      return from;
    }

    if (userData.role === 'employer') {
      return '/employer/dashboard';
    }

    return '/candidate/dashboard';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    if (!form.email.trim() || !form.password) {
      setError('Email and password are required.');
      return;
    }

    try {
      setLoading(true);

      const response = await login({
        email: form.email.trim(),
        password: form.password
      });

      const loggedInUser =
        response?.data?.user;

      if (!loggedInUser) {
        throw new Error(
          'Unable to retrieve user information.'
        );
      }

      navigate(
        getRedirectPath(loggedInUser),
        {
          replace: true
        }
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = isDark
    ? 'w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20'
    : 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20';

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
            Welcome back
          </p>

          <h1 className="text-3xl font-bold">
            Sign in to HireSense
          </h1>

          <p
            className={`mt-3 text-sm ${
              isDark
                ? 'text-slate-400'
                : 'text-slate-600'
            }`}
          >
            Access your recruitment workspace and continue where you left off.
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
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
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
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              className={inputClass}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? 'Signing in...'
              : 'Sign in'}
          </button>
        </form>

        <p
          className={`mt-6 text-center text-sm ${
            isDark
              ? 'text-slate-400'
              : 'text-slate-600'
          }`}
        >
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-sky-400 hover:text-sky-300"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}