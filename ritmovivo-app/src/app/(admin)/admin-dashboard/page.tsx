"use client";
import { useEffect, useState } from "react";
import { Users, Music2, ClipboardList, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { clasesService, inscripcionesService, reservasService } from "@/lib/services";
import { api } from "@/lib/api";
import type { Clase, Inscripcion, Reserva, User } from "@/types";

export default function AdminDashboardPage() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);

  useEffect(() => {
    clasesService.getAll().then(setClases).catch(() => {});
    inscripcionesService.getAll().then(setInscripciones).catch(() => {});
    reservasService.getAll().then(setReservas).catch(() => {});
    api.get<User[]>("/usuarios").then(setUsuarios).catch(() => {});
  }, []);

  const stats = [
    { label: "Total usuarios", value: usuarios.length, icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { label: "Clases activas", value: clases.length, icon: Music2, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
    { label: "Inscripciones", value: inscripciones.length, icon: ClipboardList, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
    { label: "Reservas", value: reservas.length, icon: CalendarDays, color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/30" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Panel de Administración</h2>
        <p className="text-gray-500 mt-1">Resumen general del sistema</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="flex items-center gap-4">
            <div className={`rounded-xl p-3 ${bg}`}><Icon className={`w-6 h-6 ${color}`} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Últimas inscripciones</h3>
          <div className="space-y-3">
            {inscripciones.slice(0, 5).map(ins => (
              <div key={ins.id} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{ins.usuario.nombre} {ins.usuario.apellido}</p>
                  <p className="text-xs text-gray-500">{ins.horario.clase.nombre}</p>
                </div>
                <Badge label={ins.estado} variant={ins.estado === "activa" ? "green" : "gray"} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Usuarios por rol</h3>
          <div className="space-y-3">
            {["admin", "instructor", "estudiante"].map(rol => (
              <div key={rol} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{rol}s</p>
                <Badge label={String(usuarios.filter(u => u.rol === rol).length)} variant="purple" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}