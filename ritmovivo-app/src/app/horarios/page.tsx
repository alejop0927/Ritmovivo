"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { horariosService, inscripcionesService } from "@/lib/services";
import type { Horario } from "@/types";

export default function HorariosPage() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [inscribiendo, setInscribiendo] = useState<string | null>(null);

  useEffect(() => {
    horariosService
      .getAll()
      .then(setHorarios)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleInscribirse = async (horarioId: string) => {
    setInscribiendo(horarioId);
    try {
      await inscripcionesService.inscribirse(horarioId);
      toast.success("¡Te has inscrito exitosamente!");
      setHorarios((prev) =>
        prev.map((h) =>
          h.id === horarioId
            ? { ...h, clase: { ...h.clase, inscritos: h.clase.inscritos + 1 } }
            : h
        )
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al inscribirse");
    } finally {
      setInscribiendo(null);
    }
  };

  const nivelColor: Record<string, "purple" | "yellow" | "red"> = {
    principiante: "purple",
    intermedio: "yellow",
    avanzado: "red",
  };

  return (
    <AppLayout title="Horarios">
      <div className="space-y-6">
        <p className="text-gray-500 dark:text-gray-400">
          Explora y reserva tu lugar en nuestras clases
        </p>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"
              />
            ))}
          </div>
        ) : horarios.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            No hay horarios disponibles
          </div>
        ) : (
          <div className="space-y-3">
            {horarios.map((h) => (
              <Card key={h.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {h.clase.nombre}
                    </h3>
                    <Badge
                      label={h.clase.nivel}
                      variant={nivelColor[h.clase.nivel] || "gray"}
                    />
                    <Badge
                      label={h.clase.estilo}
                      variant="pink"
                    />
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {h.fecha}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {h.horaInicio} - {h.horaFin}
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Instructor: {h.instructor.nombre} {h.instructor.apellido}
                  </p>
                </div>
                <Button
                  onClick={() => handleInscribirse(h.id)}
                  loading={inscribiendo === h.id}
                  disabled={!h.disponible || h.clase.inscritos >= h.clase.capacidad}
                  variant={h.disponible ? "primary" : "outline"}
                  size="sm"
                >
                  {h.disponible ? "Inscribirme" : "Sin cupos"}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
