"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Music2,
  Calendar,
  Users,
  UserCircle,
  LogOut,
  ClipboardList,
  CheckCircle,
  Brain,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getMenuItems = () => {
    if (!user) return [];

    const items = [];

    if (user.rol === "admin") {
      items.push({ href: "/admin-dashboard", label: "Dashboard", icon: Home });
      items.push({ href: "/admin-clases", label: "Gestionar Clases", icon: Music2 });
      items.push({ href: "/admin-horarios", label: "Horarios", icon: Calendar });
      items.push({ href: "/admin-instructores", label: "Instructores", icon: Users });
      items.push({ href: "/admin-inscripciones", label: "Inscripciones", icon: ClipboardList });
      items.push({ href: "/admin-reservas", label: "Reservas", icon: CheckCircle });
      items.push({ href: "/admin-usuarios", label: "Usuarios", icon: UserCircle });
      items.push({ href: "/admin-solicitudes", label: "Solicitudes", icon: ClipboardList });
    } else if (user.rol === "instructor") {
      items.push({ href: "/mis-clases", label: "Mis Clases", icon: Music2 });
      items.push({ href: "/mis-estudiantes", label: "Mis Estudiantes", icon: Users });
      items.push({ href: "/mis-horarios", label: "Mis Horarios", icon: Calendar });
    } else if (user.rol === "estudiante") {
      items.push({ href: "/dashboard", label: "Inicio", icon: Home });
      items.push({ href: "/clases", label: "Clases disponibles", icon: Music2 });
      items.push({ href: "/mis-inscripciones", label: "Mis inscripciones", icon: ClipboardList });
      // 👇 NUEVO BOTÓN
      items.push({ href: "/reservar-espacio", label: "Reservar espacio", icon: Calendar });
      items.push({ href: "/mis-reservas", label: "Mis reservas", icon: ClipboardList }); 
      items.push({ href: "/practica", label: "Práctica con IA", icon: Brain });
      items.push({ href: "/perfil", label: "Mi perfil", icon: UserCircle });
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">RitmoVivo</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 capitalize">Rol: {user?.rol}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">{children}</main>
    </div>
  );
}