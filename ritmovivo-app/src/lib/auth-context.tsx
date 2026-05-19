"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getRedirectByRole(rol: string) {
  if (rol === "admin") return "/admin-dashboard";
  if (rol === "instructor") return "/mis-clases";
  return "/dashboard";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const u = authService.getUser();
    setUser(u);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    authService.saveSession(res.token, res.user);
    setUser(res.user);
    router.push(getRedirectByRole(res.user.rol));
  };

  const register = async (data: RegisterData) => {
    const res = await authService.register(data);
    authService.saveSession(res.token, res.user);
    setUser(res.user);
    router.push(getRedirectByRole(res.user.rol));
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};