import { useEffect, useState } from 'react';
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams
} from 'react-router-dom';

import { useAuth } from './context/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import OAuthCallbackPage from './pages/OAuthCallback';

import JobsPage from './pages/Jobs';
import JobDetailsPage from './pages/JobDetails';

import CandidateResumePage from './pages/CandidateResume';
import CandidateApplicationsPage from './pages/CandidateApplicationsPage';
import CandidateApplicationDetailPage from './pages/CandidateApplicationDetailPage';
import CandidateProfilePage from './pages/CandidateProfilePage';

import EmployerDashboardPage from './pages/EmployerDashboard';
import EmployerCompanyPage from './pages/EmployerCompanyPage';
import EmployerJobsPage from './pages/EmployerJobsPage';
import EmployerCreateJobPage from './pages/EmployerCreateJobPage';
import EmployerEditJobPage from './pages/EmployerEditJobPage';
import EmployerJobApplicationsPage from './pages/EmployerJobApplicationsPage';
import EmployerCandidateDetailPage from './pages/EmployerCandidateDetailPage';

import { getJobs } from './services/jobApi';
import { getCandidateApplications, getExistingJobMatch } from './services/candidateAiApi';
import { getCandidateProfile } from './services/candidateResumeApi';

import hiresenseLogo from './assets/hiresense-logo.svg';

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('hiresense-theme');

    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    return 'dark';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = () => {
      const savedTheme = localStorage.getItem('hiresense-theme');

      if (!savedTheme) {
        setTheme('dark');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);

      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    }

    mediaQuery.addListener(handleSystemThemeChange);

    return () => {
      mediaQuery.removeListener(handleSystemThemeChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('hiresense-theme', theme);

    document.body.style.background =
      theme === 'dark' ? '#020817' : '#f8fafc';
  }, [theme]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isDark = theme === 'dark';

  return (
    <div
      className="min-h-screen"
      style={{
        background: isDark ? '#020817' : '#f8fafc',
        color: isDark ? '#e2e8f0' : '#0f172a'
      }}
    >
      <header
        className={
          isDark
            ? 'sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm'
            : 'sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-sm'
        }
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div
              className={
                isDark
                  ? 'flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 shadow-sm ring-1 ring-slate-700'
                  : 'flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200'
              }
            >
              <img
                src={hiresenseLogo}
                alt="HireSense logo"
                className="h-9 w-9"
              />
            </div>

            <div>
              <div
                className={
                  isDark
                    ? 'text-lg font-semibold tracking-tight text-white'
                    : 'text-lg font-semibold tracking-tight text-slate-900'
                }
              >
                HireSense
              </div>

              <div
                className={
                  isDark
                    ? 'text-[11px] uppercase tracking-[0.18em] text-slate-400'
                    : 'text-[11px] uppercase tracking-[0.18em] text-slate-500'
                }
              >
                Recruiting
              </div>
            </div>
          </Link>

          <nav
            className={
              isDark
                ? 'hidden items-center gap-6 text-sm text-slate-300 md:flex'
                : 'hidden items-center gap-6 text-sm text-slate-600 md:flex'
            }
          >
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? isDark
                    ? 'font-medium text-white'
                    : 'font-medium text-slate-900'
                  : isDark
                    ? 'hover:text-white'
                    : 'hover:text-slate-900'
              }
            >
              Home
            </NavLink>

            {user ? (
              user.role === 'candidate' ? (
                <>
                  <NavLink
                    to="/candidate/dashboard"
                    className={({ isActive }) =>
                      isActive
                        ? isDark
                          ? 'font-medium text-white'
                          : 'font-medium text-slate-900'
                        : isDark
                          ? 'hover:text-white'
                          : 'hover:text-slate-900'
                    }
                  >
                    Dashboard
                  </NavLink>

                  <NavLink
                    to="/candidate/resume"
                    className={({ isActive }) =>
                      isActive
                        ? isDark
                          ? 'font-medium text-white'
                          : 'font-medium text-slate-900'
                        : isDark
                          ? 'hover:text-white'
                          : 'hover:text-slate-900'
                    }
                  >
                    Resume
                  </NavLink>

                  <NavLink
                    to="/candidate/jobs"
                    className={({ isActive }) =>
                      isActive
                        ? isDark
                          ? 'font-medium text-white'
                          : 'font-medium text-slate-900'
                        : isDark
                          ? 'hover:text-white'
                          : 'hover:text-slate-900'
                    }
                  >
                    Jobs
                  </NavLink>

                  <NavLink
                    to="/candidate/applications"
                    className={({ isActive }) =>
                      isActive
                        ? isDark
                          ? 'font-medium text-white'
                          : 'font-medium text-slate-900'
                        : isDark
                          ? 'hover:text-white'
                          : 'hover:text-slate-900'
                    }
                  >
                    Applications
                  </NavLink>

                  <NavLink
                    to="/candidate/profile"
                    className={({ isActive }) =>
                      isActive
                        ? isDark
                          ? 'font-medium text-white'
                          : 'font-medium text-slate-900'
                        : isDark
                          ? 'hover:text-white'
                          : 'hover:text-slate-900'
                    }
                  >
                    Profile
                  </NavLink>
                </>
              ) : (
                <NavLink
                  to="/employer/dashboard"
                  className={({ isActive }) =>
                    isActive
                      ? isDark
                        ? 'font-medium text-white'
                        : 'font-medium text-slate-900'
                      : isDark
                        ? 'hover:text-white'
                        : 'hover:text-slate-900'
                  }
                >
                  Dashboard
                </NavLink>
              )
            ) : null}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={
                isDark
                  ? 'rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800'
                  : 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50'
              }
            >
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </button>

            {user ? (
              <>
                <span
                  className={
                    isDark
                      ? 'hidden rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-200 sm:inline-flex'
                      : 'hidden rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 sm:inline-flex'
                  }
                >
                  {user.role === 'employer' ? 'Employer' : 'Candidate'}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className={
                    isDark
                      ? 'rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800'
                      : 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50'
                  }
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={
                    isDark
                      ? 'rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800'
                      : 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50'
                  }
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className={
                    isDark
                      ? 'rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-200'
                      : 'rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800'
                  }
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {user && user.role === 'candidate' ? (
          <div className="border-t border-slate-800/80 px-4 py-3 md:hidden">
            <div className="flex flex-wrap gap-2">
              {[
                ['/candidate/dashboard', 'Dashboard'],
                ['/candidate/resume', 'Resume'],
                ['/candidate/jobs', 'Jobs'],
                ['/candidate/applications', 'Applications'],
                ['/candidate/profile', 'Profile']
              ].map(([path, label]) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `rounded-full border px-2.5 py-1.5 text-xs ${isActive
                      ? isDark
                        ? 'border-sky-500/40 bg-sky-500/10 text-sky-300'
                        : 'border-sky-200 bg-sky-50 text-sky-700'
                      : isDark
                        ? 'border-slate-700 bg-slate-900 text-slate-200'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage isDark={isDark} />} />

          <Route
            path="/login"
            element={
              user ? (
                <Navigate
                  to={
                    user.role === 'employer'
                      ? '/employer/dashboard'
                      : '/candidate/dashboard'
                  }
                  replace
                />
              ) : (
                <LoginPage isDark={isDark} />
              )
            }
          />

          <Route
            path="/register"
            element={<RegisterPage isDark={isDark} />}
          />

          <Route
            path="/oauth/callback"
            element={<OAuthCallbackPage isDark={isDark} />}
          />

          <Route
            path="/jobs"
            element={<JobsPage isDark={isDark} />}
          />

          <Route
            path="/jobs/:id"
            element={<JobDetailsPage isDark={isDark} />}
          />

          <Route
            path="/candidate/dashboard"
            element={
              <ProtectedRoute
                isDark={isDark}
                requiredRole="candidate"
              >
                <DashboardPage isDark={isDark} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/candidate/resume"
            element={
              <ProtectedRoute
                isDark={isDark}
                requiredRole="candidate"
              >
                <CandidateResumePage isDark={isDark} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/candidate/jobs"
            element={
              <ProtectedRoute
                isDark={isDark}
                requiredRole="candidate"
              >
                <JobsPage isDark={isDark} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/candidate/jobs/:id"
            element={
              <ProtectedRoute
                isDark={isDark}
                requiredRole="candidate"
              >
                <JobDetailsPage isDark={isDark} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/candidate/jobs/:id/match"
            element={
              <ProtectedRoute
                isDark={isDark}
                requiredRole="candidate"
              >
                <CandidateJobMatchRedirect />
              </ProtectedRoute>
            }
          />

          <Route
            path="/candidate/applications"
            element={
              <ProtectedRoute
                isDark={isDark}
                requiredRole="candidate"
              >
                <CandidateApplicationsPage isDark={isDark} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/candidate/applications/:id"
            element={
              <ProtectedRoute
                isDark={isDark}
                requiredRole="candidate"
              >
                <CandidateApplicationDetailPage isDark={isDark} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/candidate/profile"
            element={
              <ProtectedRoute
                isDark={isDark}
                requiredRole="candidate"
              >
                <CandidateProfilePage isDark={isDark} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <Navigate
                to={
                  user?.role === 'employer'
                    ? '/employer/dashboard'
                    : '/candidate/dashboard'
                }
                replace
              />
            }
          />

          <Route
            path="/employer"
            element={<Navigate to="/employer/dashboard" replace />}
          />

          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute
                isDark={isDark}
                requiredRole="employer"
              >
                <EmployerDashboardPage isDark={isDark} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/company"
            element={
              <ProtectedRoute
                isDark={isDark}
                requiredRole="employer"
              >
                <EmployerCompanyPage isDark={isDark} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/jobs"
            element={
              <ProtectedRoute
                isDark={isDark}
                requiredRole="employer"
              >
                <EmployerJobsPage isDark={isDark} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/jobs/create"
            element={
              <ProtectedRoute
                isDark={isDark}
                requiredRole="employer"
              >
                <EmployerCreateJobPage isDark={isDark} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/jobs/:id/edit"
            element={
              <ProtectedRoute
                isDark={isDark}
                requiredRole="employer"
              >
                <EmployerEditJobPage isDark={isDark} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/jobs/:id/applications"
            element={
              <ProtectedRoute
                isDark={isDark}
                requiredRole="employer"
              >
                <EmployerJobApplicationsPage isDark={isDark} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/candidates/:id"
            element={
              <ProtectedRoute
                isDark={isDark}
                requiredRole="employer"
              >
                <EmployerCandidateDetailPage isDark={isDark} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function CandidateJobMatchRedirect() {
  const { id } = useParams();

  return (
    <Navigate
      to={`/candidate/jobs/${id}`}
      replace
    />
  );
}

function HomePage({ isDark }) {
  const { user } = useAuth();

  const shell = isDark
    ? 'border-slate-800 bg-slate-900 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.8)]'
    : 'border-slate-200 bg-white shadow-[0_25px_60px_-35px_rgba(15,23,42,0.28)]';

  const card = isDark
    ? 'border-slate-700 bg-slate-950'
    : 'border-slate-200 bg-white';

  const soft = isDark
    ? 'border-slate-700 bg-slate-950'
    : 'border-slate-200 bg-slate-50';

  const textMain = isDark
    ? 'text-white'
    : 'text-slate-900';

  const textMuted = isDark
    ? 'text-slate-300'
    : 'text-slate-600';

  const textSoft = isDark
    ? 'text-slate-400'
    : 'text-slate-500';

  const pill = isDark
    ? 'border-sky-400/30 bg-sky-500/10 text-sky-300'
    : 'border-sky-200 bg-sky-50 text-sky-700';

  const buttonPrimary = isDark
    ? 'bg-white text-slate-900 hover:bg-slate-200'
    : 'bg-slate-900 text-white hover:bg-slate-800';

  const buttonSecondary = isDark
    ? 'border-slate-700 bg-slate-950 text-slate-100 hover:border-slate-500'
    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100';

  const feature = isDark
    ? 'border-slate-800 bg-slate-900'
    : 'border-slate-200 bg-white';

  return (
    <div className="space-y-8">
      <section
        className={`overflow-hidden rounded-[28px] border p-6 md:p-10 ${shell}`}
      >
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${pill}`}
            >
              Smarter hiring
            </span>

            <h1
              className={`max-w-xl text-4xl font-semibold tracking-tight md:text-5xl ${textMain}`}
            >
              Build better teams with clearer hiring decisions.
            </h1>

            <p
              className={`max-w-lg text-lg leading-8 ${textMuted}`}
            >
              HireSense helps teams match talent to roles, review candidate
              signals, and move faster without losing the human side of
              recruiting.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to={
                  user
                    ? user.role === 'employer'
                      ? '/employer/dashboard'
                      : '/candidate/dashboard'
                    : '/register'
                }
                className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${buttonPrimary}`}
              >
                {user ? 'Open dashboard' : 'Get started'}
              </Link>

              <Link
                to="/jobs"
                className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${buttonSecondary}`}
              >
                Explore jobs
              </Link>
            </div>

            <div
              className={`flex flex-wrap gap-6 pt-2 text-sm ${textSoft}`}
            >
              <span>2,400+ resumes analyzed</span>
              <span>94% pipeline health</span>
              <span>12 roles this week</span>
            </div>
          </div>

          <div
            className={`rounded-[24px] border p-5 shadow-inner ${soft}`}
          >
            <div
              className={`flex items-center justify-between border-b pb-4 ${isDark ? 'border-slate-700' : 'border-slate-200'
                }`}
            >
              <div>
                <p className={`text-sm ${textSoft}`}>
                  Hiring snapshot
                </p>

                <p
                  className={`mt-1 text-3xl font-semibold ${textMain}`}
                >
                  94%
                </p>
              </div>

              <div
                className={
                  isDark
                    ? 'rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300'
                    : 'rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700'
                }
              >
                +18.4%
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ['2.4k', 'Profiles scanned'],
                ['73%', 'Fit score'],
                ['12', 'Interviews'],
                ['96m', 'Avg. response']
              ].map(([value, label]) => (
                <div
                  key={label}
                  className={`rounded-2xl border p-4 ${card}`}
                >
                  <div
                    className={`text-xl font-semibold ${textMain}`}
                  >
                    {value}
                  </div>

                  <div
                    className={`mt-1 text-sm ${textSoft}`}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          [
            'AI-assisted matching',
            'Rank candidates based on role fit, strengths, and hiring signals without losing context.'
          ],
          [
            'Clearer workflows',
            'Keep recruiters, hiring managers, and candidates aligned in one workflow.'
          ],
          [
            'Faster decisions',
            'Spot top talent sooner with a cleaner, simpler hiring pipeline.'
          ]
        ].map(([title, text]) => (
          <div
            key={title}
            className={`rounded-[24px] border p-6 shadow-sm ${feature}`}
          >
            <div
              className={
                isDark
                  ? 'mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-lg text-sky-300'
                  : 'mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-lg text-sky-700'
              }
            >
              ✦
            </div>

            <h3
              className={`mb-2 text-xl font-semibold ${textMain}`}
            >
              {title}
            </h3>

            <p className={textMuted}>
              {text}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}

function LoginPage({ isDark }) {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [role, setRole] = useState('candidate');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <Navigate
        to={
          user.role === 'employer'
            ? '/employer/dashboard'
            : '/candidate/dashboard'
        }
        replace
      />
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await login(form);
      const nextUser =
        response?.user || response?.data?.user;

      navigate(
        nextUser?.role === 'employer'
          ? '/employer/dashboard'
          : '/candidate/dashboard'
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to login right now.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    const selectedRole = role || 'candidate';

    const url =
      `http://localhost:5000/api/auth/${provider}?role=${selectedRole}`;

    window.location.href = url;
  };

  return (
    <AuthPanel
      title="Welcome back"
      subtitle="Sign in to continue hiring smarter."
      onSubmit={handleSubmit}
      error={error}
      loading={loading}
      submitLabel="Login"
      isDark={isDark}
    >
      <RoleSelector
        value={role}
        onChange={setRole}
        isDark={isDark}
      />

      <TextField
        label="Email"
        type="email"
        value={form.email}
        onChange={(value) =>
          setForm({
            ...form,
            email: value
          })
        }
        isDark={isDark}
      />

      <TextField
        label="Password"
        type="password"
        value={form.password}
        onChange={(value) =>
          setForm({
            ...form,
            password: value
          })
        }
        isDark={isDark}
      />

      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          Use your recruiter or candidate account.
        </span>
      </div>

      <div className="space-y-3 pt-1">
        <div
          className={
            isDark
              ? 'flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-400'
              : 'flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500'
          }
        >
          <span className="h-px flex-1 bg-slate-700/70" />
          <span>Or continue with</span>
          <span className="h-px flex-1 bg-slate-700/70" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <SocialAuthButton
            provider="google"
            label="Google"
            icon="G"
            onClick={handleSocialLogin}
            isDark={isDark}
          />

          <SocialAuthButton
            provider="github"
            label="GitHub"
            icon="◌"
            onClick={handleSocialLogin}
            isDark={isDark}
          />
        </div>
      </div>
    </AuthPanel>
  );
}

function RegisterPage({ isDark }) {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'candidate'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      };

      await register(payload);

      navigate('/login');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to register right now.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    const selectedRole = form.role || 'candidate';

    const url =
      `http://localhost:5000/api/auth/${provider}?role=${selectedRole}`;

    window.location.href = url;
  };

  return (
    <AuthPanel
      title="Create your account"
      subtitle="Join the HireSense AI hiring network."
      onSubmit={handleSubmit}
      error={error}
      loading={loading}
      submitLabel="Register"
      isDark={isDark}
    >
      <TextField
        label="Full name"
        value={form.name}
        onChange={(value) =>
          setForm({
            ...form,
            name: value
          })
        }
        isDark={isDark}
      />

      <TextField
        label="Email"
        type="email"
        value={form.email}
        onChange={(value) =>
          setForm({
            ...form,
            email: value
          })
        }
        isDark={isDark}
      />

      <TextField
        label="Password"
        type="password"
        value={form.password}
        onChange={(value) =>
          setForm({
            ...form,
            password: value
          })
        }
        isDark={isDark}
      />

      <TextField
        label="Confirm Password"
        type="password"
        value={form.confirmPassword}
        onChange={(value) =>
          setForm({
            ...form,
            confirmPassword: value
          })
        }
        isDark={isDark}
      />

      <RoleSelector
        value={form.role}
        onChange={(role) =>
          setForm({
            ...form,
            role
          })
        }
        isDark={isDark}
      />

      <div className="space-y-3 pt-1">
        <div
          className={
            isDark
              ? 'flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-400'
              : 'flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500'
          }
        >
          <span className="h-px flex-1 bg-slate-700/70" />
          <span>Or sign up with</span>
          <span className="h-px flex-1 bg-slate-700/70" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <SocialAuthButton
            provider="google"
            label="Google"
            icon="G"
            onClick={handleSocialLogin}
            isDark={isDark}
          />

          <SocialAuthButton
            provider="github"
            label="GitHub"
            icon="◌"
            onClick={handleSocialLogin}
            isDark={isDark}
          />
        </div>
      </div>

      <div
        className={
          isDark
            ? 'pt-2 text-center text-sm text-slate-300'
            : 'pt-2 text-center text-sm text-slate-600'
        }
      >
        Already have an account?{' '}

        <Link
          to="/login"
          className={
            isDark
              ? 'font-medium text-sky-300 hover:text-sky-200'
              : 'font-medium text-sky-700 hover:text-sky-800'
          }
        >
          Login
        </Link>
      </div>
    </AuthPanel>
  );
}

function AuthPanel({
  title,
  subtitle,
  onSubmit,
  error,
  loading,
  submitLabel = 'Register',
  isDark,
  children
}) {
  const shell = isDark
    ? 'border-slate-700 bg-slate-900/80 shadow-[0_20px_50px_-25px_rgba(14,165,233,0.35)]'
    : 'border-slate-200 bg-white/90 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.22)]';

  const textMuted = isDark
    ? 'text-slate-300'
    : 'text-slate-600';

  const errorClass = isDark
    ? 'border-red-500/40 bg-red-500/10 text-red-200'
    : 'border-red-200 bg-red-50 text-red-700';

  const buttonClass = isDark
    ? 'bg-white text-slate-900 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70'
    : 'bg-slate-900 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70';

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-10">
      <div
        className={`w-full max-w-xl rounded-[28px] border p-6 sm:p-8 ${shell}`}
      >
        <div className="mb-6 text-center">
          <div
            className={
              isDark
                ? 'mb-3 text-lg font-semibold tracking-[0.2em] text-sky-300 uppercase'
                : 'mb-3 text-lg font-semibold tracking-[0.2em] text-sky-700 uppercase'
            }
          >
            HireSense
          </div>

          <h2
            className={
              isDark
                ? 'text-3xl font-bold text-white'
                : 'text-3xl font-bold text-slate-900'
            }
          >
            {title}
          </h2>

          <p className={`mt-2 text-sm ${textMuted}`}>
            {subtitle}
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4"
        >
          {children}

          {error ? (
            <div
              className={`rounded-xl border px-3 py-2 text-sm ${errorClass}`}
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${buttonClass}`}
          >
            {loading ? 'Please wait...' : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}

function RoleSelector({
  value,
  onChange,
  isDark
}) {
  const buttonClass = isDark
    ? 'rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-medium transition'
    : 'rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium transition';

  return (
    <div
      className={`space-y-2 text-sm ${isDark
        ? 'text-slate-300'
        : 'text-slate-700'
        }`}
    >
      <span>Role</span>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('candidate')}
          className={`${buttonClass} ${value === 'candidate'
            ? isDark
              ? 'border-sky-400 bg-sky-500/10 text-sky-300'
              : 'border-sky-300 bg-sky-50 text-sky-700'
            : ''
            }`}
        >
          Candidate
        </button>

        <button
          type="button"
          onClick={() => onChange('employer')}
          className={`${buttonClass} ${value === 'employer'
            ? isDark
              ? 'border-sky-400 bg-sky-500/10 text-sky-300'
              : 'border-sky-300 bg-sky-50 text-sky-700'
            : ''
            }`}
        >
          Employer
        </button>
      </div>
    </div>
  );
}

function SocialAuthButton({
  provider,
  label,
  icon,
  onClick,
  isDark
}) {
  const buttonClass = isDark
    ? 'border border-slate-700 bg-slate-950 text-slate-100 hover:border-slate-500 hover:bg-slate-900'
    : 'border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50';

  return (
    <button
      type="button"
      onClick={() => onClick(provider)}
      className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${buttonClass}`}
    >
      <span
        className={
          isDark
            ? 'flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-sky-300'
            : 'flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-sky-700'
        }
      >
        {icon}
      </span>

      {label}
    </button>
  );
}

function TextField({
  label,
  type = 'text',
  value,
  onChange,
  isDark
}) {
  const labelClass = isDark
    ? 'text-slate-300'
    : 'text-slate-700';

  const inputClass = isDark
    ? 'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-50 outline-none transition focus:border-sky-400 focus:bg-slate-950'
    : 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white';

  return (
    <label
      className={`block space-y-2 text-sm ${labelClass}`}
    >
      <span>{label}</span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={inputClass}
      />
    </label>
  );
}

function DashboardPage({ isDark }) {
  const { user } = useAuth();

  const panel = isDark
    ? 'border-slate-700 bg-slate-900'
    : 'border-slate-200 bg-white';

  const text = isDark
    ? 'text-slate-300'
    : 'text-slate-600';

  const heading = isDark
    ? 'text-white'
    : 'text-slate-900';

  const soft = isDark
    ? 'text-slate-400'
    : 'text-slate-500';

  const subtle = isDark
    ? 'border-slate-700 bg-slate-950'
    : 'border-slate-200 bg-slate-50';

  const accent = isDark
    ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
    : 'bg-sky-50 text-sky-700 border-sky-200';

  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadDashboardData = async () => {
      try {
        const [
          applicationData,
          profileData,
          jobsData
        ] = await Promise.all([
          getCandidateApplications(),
          getCandidateProfile().catch(() => null),
          getJobs({ limit: 6 }).catch(() => ({
            jobs: []
          }))
        ]);

        if (!active) {
          return;
        }

        const nextApplications =
          Array.isArray(applicationData)
            ? applicationData
            : [];

        const jobIds = [
          ...new Set(
            nextApplications
              .map(
                (application) =>
                  application.jobId ??
                  application.job?.id
              )
              .filter(Boolean)
          )
        ];

        const matchEntries =
          await Promise.all(
            jobIds.map(async (jobId) => [
              jobId,
              await getExistingJobMatch(jobId)
                .catch(() => null)
            ])
          );

        const matchByJobId =
          new Map(matchEntries);

        const applicationsWithMatches =
          nextApplications.map((application) => {
            const match =
              matchByJobId.get(
                application.jobId ??
                application.job?.id
              );

            return match
              ? {
                ...application,
                matchScore: match.matchScore,
                match
              }
              : application;
          });

        const nextJobs =
          Array.isArray(jobsData?.jobs)
            ? jobsData.jobs
            : [];

        setApplications(
          applicationsWithMatches
        );

        setProfile(profileData);
        setRecommendedJobs(nextJobs);
      } catch (requestError) {
        if (!active) {
          return;
        }

        setApplications([]);
        setProfile(null);
        setRecommendedJobs([]);

        setError(
          requestError?.response?.data?.message ||
          'Unable to load dashboard data right now.'
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      active = false;
    };
  }, []);

  const statusCounts = {
    applied: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0
  };

  applications.forEach((application) => {
    const status = String(
      application.status || ''
    ).toLowerCase();

    if (status in statusCounts) {
      statusCounts[status] += 1;
    }

    if (!status) {
      statusCounts.applied += 1;
    }
  });

  const scoreValues = applications
    .map((application) =>
      Number(
        application.matchScore ??
        application.score ??
        application.aiMatchScore ??
        application.result?.matchScore
      )
    )
    .filter(
      (value) =>
        Number.isFinite(value) &&
        value >= 0
    );

  const averageMatch = scoreValues.length
    ? Math.round(
      scoreValues.reduce(
        (sum, value) => sum + value,
        0
      ) / scoreValues.length
    )
    : null;

  const resumeScore = Number(
    profile?.resumeScore ??
    profile?.score ??
    null
  );

  const resumeStrengths =
    Array.isArray(profile?.resumeStrengths)
      ? profile.resumeStrengths.filter(Boolean)
      : [];

  const resumeGaps =
    Array.isArray(profile?.resumeGaps)
      ? profile.resumeGaps.filter(Boolean)
      : [];

  const resumeFileLabel =
    profile?.sourceDocument?.filename ||
    profile?.sourceDocument?.publicId ||
    profile?.sourceDocument?.secureUrl ||
    'Not available yet';

  const recentApplications =
    [...applications]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .slice(0, 4);

  const formatDate = (value) => {
    if (!value) {
      return 'Recently';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Recently';
    }

    return new Intl.DateTimeFormat(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    ).format(date);
  };

  const formatTrimmedName = (name) =>
    name
      ? String(name).trim()
      : 'Candidate';

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p
            className={
              isDark
                ? 'text-sm uppercase tracking-[0.2em] text-sky-300'
                : 'text-sm uppercase tracking-[0.2em] text-sky-700'
            }
          >
            Dashboard
          </p>

          <h2
            className={`mt-2 text-3xl font-bold ${heading}`}
          >
            Welcome back,{' '}
            {formatTrimmedName(
              user?.name ||
              profile?.name ||
              'Candidate'
            )}
          </h2>
        </div>

        <div
          className={`rounded-full border px-3 py-1 text-xs font-medium ${accent}`}
        >
          {profile?.aiStatus ||
            'AI profile pending'}
        </div>
      </div>

      {error ? (
        <div
          className={`rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm ${isDark
            ? 'text-red-200'
            : 'text-red-700'
            }`}
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          [
            'Total applications',
            applications.length
          ],
          ['Applied', statusCounts.applied],
          [
            'Shortlisted',
            statusCounts.shortlisted
          ],
          ['Hired', statusCounts.hired]
        ].map(([label, value]) => (
          <div
            key={label}
            className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 ${panel}`}
          >
            <div className={`text-sm ${text}`}>
              {label}
            </div>

            <div
              className={`mt-3 text-3xl font-bold ${heading}`}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div
          className={`rounded-3xl border p-5 ${panel}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={`text-sm ${text}`}>
                Resume health
              </p>

              <h3
                className={`mt-1 text-2xl font-bold ${heading}`}
              >
                {Number.isFinite(resumeScore)
                  ? `${resumeScore} / 100`
                  : 'Not available yet'}
              </h3>
            </div>

            <div
              className={`rounded-full border px-3 py-1 text-xs font-medium ${accent}`}
            >
              {profile?.sourceDocument
                ? 'Resume uploaded'
                : 'Resume pending'}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div
              className={`rounded-2xl border p-4 ${subtle}`}
            >
              <p
                className={`text-xs uppercase tracking-[0.2em] ${soft}`}
              >
                Resume status
              </p>

              <p
                className={`mt-2 font-medium ${heading}`}
              >
                {profile?.aiStatus ||
                  'Not available yet'}
              </p>
            </div>

            <div
              className={`rounded-2xl border p-4 ${subtle}`}
            >
              <p
                className={`text-xs uppercase tracking-[0.2em] ${soft}`}
              >
                Last analyzed
              </p>

              <p
                className={`mt-2 font-medium ${heading}`}
              >
                {profile?.updatedAt
                  ? formatDate(profile.updatedAt)
                  : 'Not available yet'}
              </p>
            </div>

            <div
              className={`rounded-2xl border p-4 ${subtle}`}
            >
              <p
                className={`text-xs uppercase tracking-[0.2em] ${soft}`}
              >
                Resume file
              </p>

              <p
                className={`mt-2 font-medium ${heading}`}
              >
                {resumeFileLabel}
              </p>
            </div>

            <div
              className={`rounded-2xl border p-4 ${subtle}`}
            >
              <p
                className={`text-xs uppercase tracking-[0.2em] ${soft}`}
              >
                Average match
              </p>

              <p
                className={`mt-2 font-medium ${heading}`}
              >
                {averageMatch === null
                  ? 'Not available yet'
                  : `${averageMatch}%`}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div
              className={`rounded-2xl border p-4 ${subtle}`}
            >
              <p
                className={`mb-3 text-sm font-semibold ${heading}`}
              >
                Strengths
              </p>

              {resumeStrengths.length ? (
                <div className="flex flex-wrap gap-2">
                  {resumeStrengths.map(
                    (item) => (
                      <span
                        key={item}
                        className={`rounded-full border px-2.5 py-1 text-xs ${isDark
                          ? 'border-sky-500/30 bg-sky-500/10 text-sky-300'
                          : 'border-sky-200 bg-sky-50 text-sky-700'
                          }`}
                      >
                        {item}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p className={`text-sm ${soft}`}>
                  Not available yet
                </p>
              )}
            </div>

            <div
              className={`rounded-2xl border p-4 ${subtle}`}
            >
              <p
                className={`mb-3 text-sm font-semibold ${heading}`}
              >
                Skill gaps
              </p>

              {resumeGaps.length ? (
                <div className="flex flex-wrap gap-2">
                  {resumeGaps.map(
                    (item) => (
                      <span
                        key={item}
                        className={`rounded-full border px-2.5 py-1 text-xs ${isDark
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                          }`}
                      >
                        {item}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p className={`text-sm ${soft}`}>
                  Not available yet
                </p>
              )}
            </div>
          </div>
        </div>

        <div
          className={`rounded-3xl border p-5 ${panel}`}
        >
          <p className={`text-sm ${text}`}>
            AI overview
          </p>

          <div className="mt-4 space-y-3">
            {[
              {
                label: 'Resume Analysis',
                value: Number.isFinite(resumeScore)
                  ? `${resumeScore} / 100`
                  : 'Not available yet',
                helper:
                  profile?.resumeStrengths?.length
                    ? `${profile.resumeStrengths.length} strengths`
                    : 'Awaiting resume analysis'
              },
              {
                label: 'Job Matching',
                value:
                  averageMatch === null
                    ? 'Not available yet'
                    : `${averageMatch}%`,
                helper:
                  scoreValues.length
                    ? 'Based on application data'
                    : 'No match data yet'
              },
              {
                label: 'Interview Preparation',
                value: 'Not available yet',
                helper:
                  'Questions appear after AI analysis'
              }
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border p-4 ${subtle}`}
              >
                <div
                  className={`text-xs uppercase tracking-[0.2em] ${soft}`}
                >
                  {item.label}
                </div>

                <div
                  className={`mt-2 text-xl font-bold ${heading}`}
                >
                  {item.value}
                </div>

                <div
                  className={`mt-1 text-xs ${soft}`}
                >
                  {item.helper}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div
          className={`rounded-3xl border p-5 ${panel}`}
        >
          <div className="flex items-center justify-between gap-3">
            <h3
              className={`text-xl font-semibold ${heading}`}
            >
              Recent applications
            </h3>

            <Link
              to="/candidate/applications"
              className={
                isDark
                  ? 'text-sm text-sky-300 hover:text-sky-200'
                  : 'text-sm text-sky-700 hover:text-sky-800'
              }
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div
              className={`mt-4 text-sm ${soft}`}
            >
              Loading applications…
            </div>
          ) : recentApplications.length ? (
            <div className="mt-4 space-y-3">
              {recentApplications.map(
                (application) => (
                  <Link
                    key={application.id}
                    to={`/candidate/applications/${application.id}`}
                    className={`block rounded-2xl border p-4 transition hover:-translate-y-0.5 ${subtle}`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p
                          className={`font-semibold ${heading}`}
                        >
                          {application.job?.title ||
                            'Job application'}
                        </p>

                        <p
                          className={`mt-1 text-sm ${soft}`}
                        >
                          {application.company?.name ||
                            'Company'}{' '}
                          •{' '}
                          {application.job?.location ||
                            'Location not specified'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs ${isDark
                            ? 'border-slate-700 bg-slate-900 text-slate-200'
                            : 'border-slate-200 bg-white text-slate-700'
                            }`}
                        >
                          {String(
                            application.status ||
                            'Applied'
                          )
                            .charAt(0)
                            .toUpperCase() +
                            String(
                              application.status ||
                              'Applied'
                            ).slice(1)}
                        </span>

                        <span
                          className={`text-xs ${soft}`}
                        >
                          {application.matchScore !==
                            null &&
                            application.matchScore !==
                            undefined
                            ? `${application.matchScore}%`
                            : 'Match N/A'}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`mt-2 text-xs ${soft}`}
                    >
                      Applied on{' '}
                      {formatDate(
                        application.createdAt
                      )}
                    </div>
                  </Link>
                )
              )}
            </div>
          ) : (
            <p className={`mt-4 text-sm ${soft}`}>
              No applications yet.
            </p>
          )}
        </div>

        <div
          className={`rounded-3xl border p-5 ${panel}`}
        >
          <div className="flex items-center justify-between gap-3">
            <h3
              className={`text-xl font-semibold ${heading}`}
            >
              Recommended jobs
            </h3>

            <Link
              to="/candidate/jobs"
              className={
                isDark
                  ? 'text-sm text-sky-300 hover:text-sky-200'
                  : 'text-sm text-sky-700 hover:text-sky-800'
              }
            >
              Explore jobs
            </Link>
          </div>

          {loading ? (
            <div
              className={`mt-4 text-sm ${soft}`}
            >
              Loading jobs…
            </div>
          ) : recommendedJobs.length ? (
            <div className="mt-4 space-y-3">
              {recommendedJobs
                .slice(0, 3)
                .map((job) => (
                  <Link
                    key={job.id}
                    to={`/candidate/jobs/${job.id}`}
                    className={`block rounded-2xl border p-4 ${subtle}`}
                  >
                    <p
                      className={`font-semibold ${heading}`}
                    >
                      {job.title || 'Role'}
                    </p>

                    <p
                      className={`mt-1 text-sm ${soft}`}
                    >
                      {job.company ||
                        job.companyName ||
                        'Company'}{' '}
                      •{' '}
                      {job.location ||
                        'Location not specified'}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.roleLevel ? (
                        <span
                          className={`rounded-full border px-2 py-1 text-[11px] ${isDark
                            ? 'border-slate-700 bg-slate-900 text-slate-200'
                            : 'border-slate-200 bg-white text-slate-700'
                            }`}
                        >
                          {job.roleLevel}
                        </span>
                      ) : null}

                      {job.employmentType ? (
                        <span
                          className={`rounded-full border px-2 py-1 text-[11px] ${isDark
                            ? 'border-slate-700 bg-slate-900 text-slate-200'
                            : 'border-slate-200 bg-white text-slate-700'
                            }`}
                        >
                          {job.employmentType}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                ))}
            </div>
          ) : (
            <p className={`mt-4 text-sm ${soft}`}>
              No recommended jobs are available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;