"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { User } from "../types/auth";
import authService from "../services/auth.service";
import { getToken, saveToken, removeToken } from "../utils/token";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, plainPassword: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Try to restore the JWT session on initial mount
  useEffect(() => {
    async function restoreSession() {
      const token = getToken();
      if (token) {
        try {
          const profile = await authService.getCurrentUser();
          setUser(profile);
        } catch (error) {
          console.error("Failed to restore JWT session:", error);
          removeToken();
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    restoreSession();
  }, []);

  const login = async (email: string, plainPassword: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, plainPassword);
      saveToken(response.access_token);
      
      const profile = await authService.getCurrentUser();
      setUser(profile);
      
      router.push("/dashboard");
    } catch (error) {
      removeToken();
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    removeToken();
    setUser(null);
    router.push("/login");
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const profile = await authService.getCurrentUser();
      setUser(profile);
    } catch (error) {
      logout();
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
