import { api } from "./api";
import type { AuthResponse, User } from "@/types";

export const authService = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),

  register: (data: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    telefono?: string;
  }) => api.post<AuthResponse>("/auth/register", data),

  me: () => api.get<User>("/auth/me"),

  logout: () => {
    localStorage.removeItem("rv_token");
    localStorage.removeItem("rv_user");
    document.cookie = "rv_token=; path=/; max-age=0";
  },

  saveSession: (token: string, user: User) => {
    localStorage.setItem("rv_token", token);
    localStorage.setItem("rv_user", JSON.stringify(user));
    document.cookie = `rv_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
  },

  getUser: (): User | null => {
    if (typeof window === "undefined") return null;
    const u = localStorage.getItem("rv_user");
    return u ? JSON.parse(u) : null;
  },

  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("rv_token");
  },
};
