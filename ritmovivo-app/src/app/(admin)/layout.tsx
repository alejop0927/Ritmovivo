"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/layout/AppLayout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.rol !== "admin") router.replace("/dashboard");
  }, [user, loading, router]);

  if (loading || !user || user.rol !== "admin") return null;
  return <AppLayout>{children}</AppLayout>;
}