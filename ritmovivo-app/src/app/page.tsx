"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Music2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (user.rol === "admin") router.replace("/admin-dashboard");
    else if (user.rol === "instructor") router.replace("/mis-clases");
    else router.replace("/dashboard");
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-white">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
          <Music2 className="w-8 h-8" />
        </div>
        <p className="text-gray-400">Cargando RitmoVivo...</p>
      </div>
    </div>
  );
}