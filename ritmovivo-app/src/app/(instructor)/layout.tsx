"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/layout/AppLayout";

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.rol === "admin") router.replace("/admin-dashboard");
    else if (user.rol === "estudiante") router.replace("/dashboard");
  }, [user, loading, router]);

  if (loading || !user || user.rol !== "instructor") return null;
  return <AppLayout>{children}</AppLayout>;
}