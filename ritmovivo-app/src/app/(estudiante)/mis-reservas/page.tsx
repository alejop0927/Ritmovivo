"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

type Reserva = {
  id: string;
  horario_id?: string;
  salon?: string;
  fecha?: string;
  hora_inicio?: string;
  hora_fin?: string;
  numero_personas: number;
  con_profesor: boolean;
  estado: string;
  created_at: string;
  horario?: {
    clase: { nombre: string };
    salon: string;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
  } | null;
};

const estadoColor: Record<string, "yellow" | "green" | "red"> = {
  pendiente: "yellow",
  confirmada: "green",
  cancelada: "red",
};

const estadoTexto: Record<string, string> = {
  pendiente: "Pendiente de aprobación",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
};

export default function MisReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Reserva[]>("/reservas/mis-reservas")
      .then(setReservas)
      .catch(() => toast.error("Error al cargar tus reservas"))
      .finally(() => setLoading(false));
  }, []);

  const obtenerDescripcion = (r: Reserva) => {
    if (r.horario_id && r.horario) {
      // Reserva de clase
      return `${r.horario.clase.nombre} - Salón: ${r.horario.salon} - ${new Date(r.horario.fecha).toLocaleDateString()} ${r.horario.hora_inicio} a ${r.horario.hora_fin}`;
    } else {
      // Reserva libre
      return `Salón: ${r.salon} - ${new Date(r.fecha!).toLocaleDateString()} ${r.hora_inicio} a ${r.hora_fin}`;
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando tus reservas...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mis reservas</h2>
        <p className="text-gray-500">Estado de tus solicitudes de reserva</p>
      </div>

      {reservas.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No has realizado ninguna reserva</div>
      ) : (
        <div className="space-y-3">
          {reservas.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <p className="font-medium">{obtenerDescripcion(r)}</p>
                  <p className="text-sm text-gray-500">
                    Personas: {r.numero_personas} · {r.con_profesor ? "Con instructor" : "Sin instructor"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Solicitado el: {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge label={estadoTexto[r.estado]} variant={estadoColor[r.estado] || "gray"} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}