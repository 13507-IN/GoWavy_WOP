"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCurrentUser,
  getGoogleAuthUrl,
  loginUser,
  logoutUser,
  registerUser,
  type AuthUser,
} from "@/lib/api";

type AuthMode = "login" | "register";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCurrentUser();
      setUser(data.user);
      setError(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    setLoading(true);
    getCurrentUser()
      .then((data) => {
        if (!active) return;
        setUser(data.user);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const authenticate = useCallback(
    async (
      mode: AuthMode,
      payload: { email: string; password: string; name?: string }
    ) => {
      const response =
        mode === "register"
          ? await registerUser({
              name: payload.name || "Traveler",
              email: payload.email,
              password: payload.password,
            })
          : await loginUser({
              email: payload.email,
              password: payload.password,
            });

      setUser(response.user);
      setError(null);
      return response.user;
    },
    []
  );

  const signOut = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const startGoogleAuth = useCallback(() => {
    window.location.href = getGoogleAuthUrl();
  }, []);

  return {
    user,
    loading,
    error,
    setError,
    refreshUser,
    authenticate,
    signOut,
    startGoogleAuth,
  };
}
