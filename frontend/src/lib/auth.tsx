/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types/models";
import { useCurrentUser } from "@/features/auth/api/get-current-user";
import { loginWithEmailAndPassword } from "@/features/auth/api/login";
import { logout as logoutFn } from "@/features/auth/api/logout";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: { email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useCurrentUser();

  const login = useCallback(
    async (data: { email: string; password: string }) => {
      const loggedInUser = await loginWithEmailAndPassword(data);
      queryClient.setQueryData(["auth", "me"], loggedInUser);
      return loggedInUser;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await logoutFn();
    // Set auth to null first so the useQuery observer is notified (data changed),
    // then clear all cached data. The resulting /api/auth/me/ 403 on the login
    // page is suppressed by the interceptor (it checks the request URL).
    queryClient.setQueryData(["auth", "me"], null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user: user ?? null,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function useUser(): User {
  const { user } = useAuth();
  if (!user) {
    // Fallback: read directly from query cache to handle the brief gap
    // between cache update and React re-render after login
    const queryClient = useQueryClient();
    const cachedUser = queryClient.getQueryData<User>(["auth", "me"]);
    if (cachedUser) return cachedUser;
    throw new Error("useUser must be used when user is authenticated");
  }
  return user;
}
