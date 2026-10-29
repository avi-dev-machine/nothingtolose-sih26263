"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, UserProfile, AuthResponse } from "@/lib/api";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  loginAs: (role: string, email?: string, institution_id?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("apaar_token");
    const savedUser = localStorage.getItem("apaar_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify with /me
        api.getMe()
          .then((profile) => {
            setUser(profile);
            localStorage.setItem("apaar_user", JSON.stringify(profile));
          })
          .catch(() => {
            // Token expired or invalid
            logout();
          })
          .finally(() => setIsLoading(false));
      } catch {
        logout();
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const loginAs = async (role: string, email?: string, institution_id?: string) => {
    setIsLoading(true);
    try {
      const res: AuthResponse = await api.demoLogin(role, email, institution_id);
      localStorage.setItem("apaar_token", res.access_token);
      const userProfile: UserProfile = {
        id: "demo-user-id",
        email: res.email,
        full_name: res.full_name,
        role: res.role as any,
        institution_id: res.institution_id,
        institution_name: res.institution_name,
      };
      localStorage.setItem("apaar_user", JSON.stringify(userProfile));
      setToken(res.access_token);
      setUser(userProfile);

      // Route to appropriate landing page
      if (res.role === "AICTE_ADMIN") {
        router.push("/aicte/dashboard");
      } else if (res.role === "INSTITUTION_ADMIN") {
        router.push("/institution/dashboard");
      } else if (res.role === "STUDENT") {
        router.push("/student/dashboard");
      } else if (res.role === "AUTHORIZED_VERIFIER") {
        router.push("/verifier/check");
      }
    } catch (err: any) {
      alert(`Demo login failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("apaar_token");
    localStorage.removeItem("apaar_user");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
