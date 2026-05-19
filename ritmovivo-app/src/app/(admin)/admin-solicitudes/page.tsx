"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { Inscripcion } from "@/types";

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await api.get<Inscripcion[]>("/inscripciones/pendientes");
      setSolicitudes(data);
    } catch (error) {
      toast.error("Error al cargar solicitudes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const aprobar = async (id: string) => {
    setProcesando(id);
    try {
      await api.patch(`/inscripciones/aprobar/${id}`, {});
      toast.success("Solicitud aprobada. El estudiante ahora está matriculado.");
      setSolicitudes((prev) => prev.filter((s) => s.id !== id));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al aprobar");
    } finally {
      setProcesando(null);
    }
  };

  const rechazar = async (id: string) => {
    setProcesando(id);
    try {
      await api.patch(`/inscripciones/rechazar/${id}`, {});
      toast.success("Solicitud rechazada.");
      setSolicitudes((prev) => prev.filter((s) => s.id !== id));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al rechazar");
    } finally {
      setProcesando(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Solicitudes de inscripción</h2>
          <p className="text-gray-500 mt-1">Aprueba o rechaza las solicitudes de los estudiantes</p>
        </div>
        <Button variant="outline" size="sm" onClick={cargar} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refrescar
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No hay solicitudes pendientes</div>
      ) : (
        <div className="space-y-3">
          {solicitudes.map((s) => (
            <Card key={s.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {s.usuario.nombre} {s.usuario.apellido}
                  </span>
                  <Badge label={s.usuario.email} variant="gray" />
                  <Badge label="Pendiente" variant="yellow" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Quiere inscribirse a <strong>{s.horario.clase.nombre}</strong> ({s.horario.clase.estilo})
                </p>
                <p className="text-xs text-gray-500">
                  Horario: {s.horario.fecha} {s.horario.hora_inicio} - {s.horario.hora_fin} · Salón {s.horario.salon}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => aprobar(s.id)}
                  loading={procesando === s.id}
                  disabled={procesando === s.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" /> Aprobar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => rechazar(s.id)}
                  loading={procesando === s.id}
                  disabled={procesando === s.id}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Rechazar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}