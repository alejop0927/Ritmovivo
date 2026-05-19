"use client";
import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { horariosService, reservasService } from "@/lib/services";
import type { Horario } from "@/types";

const nivelColor: Record<string, "purple" | "yellow" | "red"> = {
  principiante: "purple",
  intermedio: "yellow",
  avanzado: "red",
};

export default function HorariosEstudiantePage() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  // IDs de horarios ya reservados por este estudiante
  const [reservados, setReservados] = useState<Set<string>>(new Set());
  const [reservando, setReservando] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      horariosService.getAll(),
      reservasService.getMias(),
    ])
      .then(([hs, misReservas]) => {
        setHorarios(hs);
        const ids = new Set(
          misReservas
            .filter((r) => r.estado !== "cancelada")
            .map((r) => r.horario_id ?? r.horario?.id)
            .filter(Boolean) as string[]
        );
        setReservados(ids);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleReservar = async (horarioId: string) => {
    setReservando(horarioId);
    try {
      await reservasService.reservar(horarioId);
      setReservados((prev) => new Set([...prev, horarioId]));
      toast.success("¡Reserva enviada! Queda pendiente de aprobación por el instructor o admin.");
    } catch (err: any) {
      toast.error(err?.message ?? "Error al reservar");
    } finally {
      setReservando(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Horarios disponibles
        </h2>
        <p className="text-gray-500 mt-1">
          Reserva tu lugar en un horario — quedará pendiente de aprobación
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"
            />
          ))}
        </div>
      ) : horarios.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No hay horarios disponibles en este momento
        </div>
      ) : (
        <div className="space-y-3">
          {horarios.map((h) => {
            const yaReservado = reservados.has(h.id);
            const sinCupos =
              !h.disponible || h.clase.inscritos >= h.clase.capacidad;
            return (
              <Card
                key={h.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {h.clase.nombre}
                    </h3>
                    <Badge
                      label={h.clase.nivel}
                      variant={nivelColor[h.clase.nivel] || "gray"}
                    />
                    <Badge label={h.clase.estilo} variant="pink" />
                    <Badge
                      label={h.disponible ? "Disponible" : "Sin cupos"}
                      variant={h.disponible ? "green" : "red"}
                    />
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {typeof h.fecha === "string"
                        ? h.fecha.split("T")[0]
                        : String(h.fecha)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {h.hora_inicio} - {h.hora_fin}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {h.salon}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {h.clase.inscritos}/{h.clase.capacidad} cupos
                    </span>
                  </div>
                  {h.instructor && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      👤 Instructor: {h.instructor.nombre} {h.instructor.apellido}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <Button
                    onClick={() => handleReservar(h.id)}
                    loading={reservando === h.id}
                    disabled={yaReservado || sinCupos || reservando === h.id}
                    variant={yaReservado ? "outline" : sinCupos ? "outline" : "primary"}
                    size="sm"
                  >
                    {yaReservado
                      ? "Reservado ✓"
                      : sinCupos
                      ? "Sin cupos"
                      : "Reservar lugar"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}