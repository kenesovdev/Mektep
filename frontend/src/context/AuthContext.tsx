import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import api, { tokenStorage } from '@/api/axios';
import type { AuthContextValue, AuthUser } from '@/types/auth';

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (): Promise<AuthUser> => {
    const { data } = await api.get<AuthUser>('/api/auth/me/');
    setUser(data);
    return data;
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const { data } = await api.post<{ access: string; refresh: string }>('/api/auth/login/', {
      email,
      password,
    });
    tokenStorage.setTokens(data.access, data.refresh);
    return fetchUser();
  }, [fetchUser]);

  const logout = useCallback((): void => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    const init = async (): Promise<void> => {
      if (!tokenStorage.getAccess()) {
        setLoading(false);
        return;
      }

      try {
        await fetchUser();
      } catch {
        tokenStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [fetchUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
