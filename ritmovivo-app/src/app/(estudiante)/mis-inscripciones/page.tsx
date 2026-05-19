"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { inscripcionesService } from "@/lib/services";
import { Video, Clock, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Inscripcion } from "@/types";

export default function MisInscripcionesPage() {
  const router = useRouter();
  const [pendientes, setPendientes] = useState<Inscripcion[]>([]);
  const [activas, setActivas] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      inscripcionesService.getMisPendientes(),
      inscripcionesService.getMisActivas(),
    ])
      .then(([pend, act]) => {
        setPendientes(pend);
        setActivas(act);
      })
      .catch(() => toast.error("Error al cargar tus inscripciones"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Mis inscripciones</h2>
        <p className="text-gray-500">Solicitudes pendientes y clases activas</p>
      </div>

      {/* Solicitudes pendientes */}
      <div>
        <h3 className="text-lg font-semibold mb-3">⏳ Solicitudes pendientes</h3>
        {pendientes.length === 0 ? (
          <p className="text-gray-500">No tienes solicitudes pendientes.</p>
        ) : (
          <div className="space-y-3">
            {pendientes.map((ins) => (
              <Card key={ins.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{ins.horario.clase.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {ins.horario.fecha} · {ins.horario.hora_inicio} - {ins.horario.hora_fin}
                    </p>
                    <p className="text-xs text-gray-400">{ins.horario.salon}</p>
                  </div>
                  <Badge label="Pendiente" variant="yellow" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Clases activas (matriculado) */}
      <div>
        <h3 className="text-lg font-semibold mb-3">✅ Clases activas</h3>
        {activas.length === 0 ? (
          <p className="text-gray-500">Aún no estás matriculado en ninguna clase.</p>
        ) : (
          <div className="space-y-3">
            {activas.map((ins) => (
              <Card key={ins.id} className="p-4">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div>
                    <p className="font-medium">{ins.horario.clase.nombre}</p>
                    <div className="flex gap-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {ins.horario.hora_inicio}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ins.horario.salon}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => router.push(`/clase-virtual/${ins.horario.clase.id}`)}
                  >
                    <Video className="w-4 h-4 mr-1" /> Entrar a clase
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}