import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../services/api';

export default function OAuthCallbackPage({ isDark = true }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();
  const processedCodeRef = useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const exchangeCode = async () => {
      const code = searchParams.get('code');

      if (!code) {
        if (active) {
          setLoading(false);
          setError('OAuth code is missing. Please try again.');
        }
        return;
      }

      if (processedCodeRef.current === code) {
        return;
      }

      processedCodeRef.current = code;

      try {
        const response = await api.post('/auth/oauth/exchange', { code });
        const data = response.data?.data || {};
        const nextUser = data.user;
        const accessToken = data.accessToken;
        const refreshToken = data.refreshToken;

        if (!accessToken || !refreshToken || !nextUser) {
          throw new Error('Invalid authentication response.');
        }

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userRole', nextUser.role || 'candidate');

        if (active) {
          setUser(nextUser);
          setLoading(false);
        }

        navigate(nextUser.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard', { replace: true });
      } catch (err) {
        if (!active) {
          return;
        }

        setLoading(false);
        setError(err.response?.data?.message || 'Authentication failed. Please try again.');
      }
    };

    exchangeCode();

    return () => {
      active = false;
    };
  }, [navigate, searchParams, setUser]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className={`w-full max-w-md rounded-[28px] border p-8 text-center ${isDark ? 'border-slate-700 bg-slate-900 shadow-[0_25px_60px_-35px_rgba(2,8,23,0.9)]' : 'border-slate-200 bg-white shadow-[0_25px_60px_-35px_rgba(15,23,42,0.25)]'}`}>
          <p className={isDark ? 'text-sm uppercase tracking-[0.2em] text-sky-300' : 'text-sm uppercase tracking-[0.2em] text-sky-700'}>HireSense</p>
          <h1 className={`mt-4 text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Authentication failed</h1>
          <p className={`mt-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{error}</p>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className={`mt-6 rounded-xl px-4 py-2.5 text-sm font-medium ${isDark ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className={`w-full max-w-md rounded-[28px] border p-8 text-center ${isDark ? 'border-slate-700 bg-slate-900 shadow-[0_25px_60px_-35px_rgba(2,8,23,0.9)]' : 'border-slate-200 bg-white shadow-[0_25px_60px_-35px_rgba(15,23,42,0.25)]'}`}>
        <div className={`mx-auto h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent ${isDark ? 'text-sky-300' : 'text-sky-700'}`} />
        <h1 className={`mt-6 text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Signing you in...</h1>
        <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {loading ? 'Please wait while we complete authentication.' : 'Redirecting you to your dashboard...'}
        </p>
      </div>
    </div>
  );
}
