"use client";
import { useEffect, useState } from "react";
import { Music2, Users, Calendar, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";
import { inscripcionesService, horariosService } from "@/lib/services";
import type { Inscripcion, Horario } from "@/types";

export default function DashboardEstudiantePage() {
  const { user } = useAuth();
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);

  useEffect(() => {
    // ✅ Cambiado: getMias() ya no existe, ahora se usa getMisActivas()
    inscripcionesService.getMisActivas()
      .then(setInscripciones)
      .catch(() => {});
    horariosService.getAll()
      .then(h => setHorarios(h.slice(0, 5)))
      .catch(() => {});
  }, []);

  const stats = [
    { label: "Clases activas", value: inscripciones.filter(i => i.estado === "activa").length, icon: Music2, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
    { label: "Completadas", value: inscripciones.filter(i => i.estado === "completada").length, icon: TrendingUp, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
    { label: "Horarios disponibles", value: horarios.filter(h => h.disponible).length, icon: Calendar, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { label: "Total inscripciones", value: inscripciones.length, icon: Users, color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/30" },
  ];

  const nivelColor: Record<string, "purple" | "yellow" | "red"> = {
    principiante: "purple", intermedio: "yellow", avanzado: "red",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">¡Hola, {user?.nombre}! 👋</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Bienvenido de vuelta a RitmoVivo</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="flex items-center gap-4">
            <div className={`rounded-xl p-3 ${bg}`}><Icon className={`w-6 h-6 ${color}`} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Mis inscripciones activas</h3>
          {inscripciones.filter(i => i.estado === "activa").length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No tienes inscripciones activas</p>
          ) : (
            <div className="space-y-3">
              {inscripciones.filter(i => i.estado === "activa").map(ins => (
                <div key={ins.id} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{ins.horario.clase.nombre}</p>
                    <p className="text-xs text-gray-500">{ins.horario.hora_inicio} - {ins.horario.hora_fin} · {ins.horario.salon}</p>
                  </div>
                  <Badge label={ins.horario.clase.nivel} variant={nivelColor[ins.horario.clase.nivel] || "gray"} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Próximas clases disponibles</h3>
          {horarios.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No hay horarios disponibles</p>
          ) : (
            <div className="space-y-3">
              {horarios.map(h => (
                <div key={h.id} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{h.clase.nombre}</p>
                    <p className="text-xs text-gray-500">{h.fecha} · {h.hora_inicio} · {h.salon}</p>
                  </div>
                  <Badge label={h.disponible ? "Disponible" : "Lleno"} variant={h.disponible ? "green" : "red"} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}