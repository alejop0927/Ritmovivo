"use client";
import { useEffect, useState } from "react";
import { Search, Clock, Users, BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { clasesService, inscripcionesService } from "@/lib/services";
import type { Clase } from "@/types";

const nivelColor: Record<string, "purple" | "yellow" | "red"> = {
  principiante: "purple",
  intermedio: "yellow",
  avanzado: "red",
};

export default function ClasesEstudiantePage() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  // IDs de clases para las que ya tengo solicitud pendiente o ya estoy activo
  const [solicitadas, setSolicitadas] = useState<Set<string>>(new Set());
  const [activas, setActivas] = useState<Set<string>>(new Set());
  const [solicitando, setSolicitando] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      clasesService.getAll(),
      inscripcionesService.getMisPendientes(),
      inscripcionesService.getMisActivas(),
    ])
      .then(([cls, pendientes, activasList]) => {
        setClases(cls);
        const pendientesIds = new Set(
          pendientes.map((i: any) => i.horario.clase.id)
        );
        const activasIds = new Set(
          activasList.map((i: any) => i.horario.clase.id)
        );
        setSolicitadas(pendientesIds);
        setActivas(activasIds);
      })
      .catch((err) => {
        console.error(err);
        if (err?.message?.includes("401")) {
          toast.error("Sesión expirada, inicia sesión nuevamente");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSolicitar = async (clase: Clase) => {
    setSolicitando(clase.id);
    try {
      // Obtener horarios disponibles para la clase
      const { api } = await import("@/lib/api");
      const horarios = await api.get<any[]>(`/horarios?claseId=${clase.id}`);
      const disponible = horarios.find((h) => h.disponible);
      if (!disponible) {
        toast.error("No hay horarios disponibles para esta clase");
        return;
      }
      // Enviar solicitud (estado pendiente)
      await inscripcionesService.solicitar(disponible.id);
      setSolicitadas((prev) => new Set([...prev, clase.id]));
      toast.success(
        `✅ Solicitud enviada para ${clase.nombre}. El administrador la revisará.`
      );
    } catch (err: any) {
      const mensaje =
        err?.response?.data?.message || err?.message || "Error al solicitar";
      toast.error(mensaje);
    } finally {
      setSolicitando(null);
    }
  };

  const filtered = clases.filter(
    (c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.estilo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Clases disponibles
        </h2>
        <p className="text-gray-500 mt-1">
          Solicita tu lugar — el administrador aprobará tu inscripción
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar clases..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No se encontraron clases</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((clase) => {
            const yaSolicitada = solicitadas.has(clase.id);
            const yaActiva = activas.has(clase.id);
            const llena = clase.inscritos >= clase.capacidad;
            const deshabilitado = yaActiva || yaSolicitada || llena;
            let botonTexto = "Inscribirse";
            let botonVariant: "primary" | "outline" = "primary";
            if (yaActiva) {
              botonTexto = "Matriculado ✓";
              botonVariant = "outline";
            } else if (yaSolicitada) {
              botonTexto = "Solicitud enviada ⏳";
              botonVariant = "outline";
            } else if (llena) {
              botonTexto = "Sin cupos";
              botonVariant = "outline";
            }

            return (
              <Card key={clase.id} className="flex flex-col gap-3 p-0 overflow-hidden">
                <div className="h-36 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-4xl">💃</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {clase.nombre}
                      </h3>
                      <p className="text-xs text-gray-500">{clase.estilo}</p>
                    </div>
                    <Badge label={clase.nivel} variant={nivelColor[clase.nivel] || "gray"} />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {clase.descripcion}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {clase.duracion} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {clase.inscritos}/{clase.capacidad} cupos
                    </span>
                  </div>
                  {clase.instructor && (
                    <p className="text-xs text-gray-500">
                      Instructor: {clase.instructor.nombre} {clase.instructor.apellido}
                    </p>
                  )}
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={deshabilitado || solicitando === clase.id}
                    loading={solicitando === clase.id}
                    onClick={() => handleSolicitar(clase)}
                    variant={botonVariant}
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                    {botonTexto}
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