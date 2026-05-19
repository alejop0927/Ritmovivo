"use client";
import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Horario } from "@/types";

export default function MisHorariosInstructorPage() {
  const { user } = useAuth();
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ id: string }>("/instructores/mi-perfil")
      .then(perfil => api.get<Horario[]>("/horarios").then(todos =>
        setHorarios(todos.filter(h => h.instructor?.id === perfil.id))
      ))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Horarios</h2>
        <p className="text-gray-500 mt-1">Tus sesiones programadas</p>
      </div>
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-gray-200 animate-pulse" />)}</div>
      ) : horarios.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No tienes horarios asignados</div>
      ) : (
        <div className="space-y-3">
          {horarios.map(h => (
            <Card key={h.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">{h.clase.nombre}</h3>
                <Badge label={h.disponible ? "Activo" : "Lleno"} variant={h.disponible ? "green" : "red"} />
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{h.fecha}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{h.hora_inicio} - {h.hora_fin}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{h.salon}</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{h.clase.inscritos}/{h.clase.capacidad}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}