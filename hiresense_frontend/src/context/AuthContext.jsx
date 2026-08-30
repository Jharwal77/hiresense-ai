import { useEffect, useMemo, useState } from 'react';
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser
} from '../services/api';
import { AuthContext } from './AuthContextValue';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrapSession = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const currentUser =
          await fetchCurrentUser();

        if (mounted) {
          setUser(currentUser);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const clearUser = () => {
      setUser(null);
    };

    window.addEventListener(
      'hiresense:auth-cleared',
      clearUser
    );

    return () => {
      window.removeEventListener(
        'hiresense:auth-cleared',
        clearUser
      );
    };
  }, []);

  const handleLogin = async (payload) => {
    const data =
      await loginUser(payload);

    const nextUser =
      data?.data?.user;

    setUser(nextUser);

    return data;
  };

  const handleRegister = async (payload) => {
    return registerUser(payload);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}