"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/layout/AppLayout";

export default function EstudianteLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.rol === "admin") router.replace("/admin-dashboard");
    else if (user.rol === "instructor") router.replace("/mis-clases");
  }, [user, loading, router]);

  if (loading || !user || user.rol !== "estudiante") return null;
  return <AppLayout>{children}</AppLayout>;
}