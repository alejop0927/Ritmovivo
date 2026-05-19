"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

type Reserva = {
  id: string;
  usuario_id: string;
  horario_id?: string;
  salon?: string;
  fecha?: string;
  hora_inicio?: string;
  hora_fin?: string;
  numero_personas: number;
  con_profesor: boolean;
  estado: string;
  created_at: string;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
  horario?: {
    id: string;
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

export default function AdminReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);

  const cargarReservas = () => {
    api
      .get<Reserva[]>("/reservas")
      .then(setReservas)
      .catch(() => toast.error("Error al cargar reservas"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  const cambiarEstado = async (id: string, estado: string) => {
  setProcesando(id);
  try {
    await api.post(`/reservas/${id}/estado`, { estado });
    toast.success(`Reserva ${estado === "confirmada" ? "confirmada" : "rechazada"}`);
    cargarReservas();
  } catch (err) {
    console.error(err);
    toast.error("Error al actualizar");
  } finally {
    setProcesando(null);
  }
};

  if (loading) return <div className="p-8 text-center">Cargando reservas...</div>;

  const pendientes = reservas.filter((r) => r.estado === "pendiente");
  const confirmadas = reservas.filter((r) => r.estado === "confirmada");
  const canceladas = reservas.filter((r) => r.estado === "cancelada");

  // Función para mostrar la descripción de la reserva (clase o libre)
  const obtenerDescripcion = (r: Reserva) => {
    if (r.horario_id && r.horario) {
      // Reserva de clase
      return `${r.horario.clase.nombre} - Salón: ${r.horario.salon} - ${new Date(r.horario.fecha).toLocaleDateString()} ${r.horario.hora_inicio} a ${r.horario.hora_fin}`;
    } else {
      // Reserva libre
      return `Salón: ${r.salon} - ${new Date(r.fecha!).toLocaleDateString()} ${r.hora_inicio} a ${r.hora_fin}`;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reservas</h2>
      <p>
        {pendientes.length} pendientes · {confirmadas.length} confirmadas · {canceladas.length} canceladas
      </p>

      {pendientes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-yellow-600 font-semibold">⏳ Pendientes de aprobación</h3>
          {pendientes.map((r) => (
            <Card key={r.id} className="p-4 border-yellow-200">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <p>
                    <strong>
                      {r.usuario.nombre} {r.usuario.apellido}
                    </strong>{" "}
                    ({r.usuario.email})
                  </p>
                  <p className="text-sm">{obtenerDescripcion(r)}</p>
                  <p className="text-xs text-gray-500">
                    Personas: {r.numero_personas} · {r.con_profesor ? "Con instructor" : "Sin instructor"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600"
                    onClick={() => cambiarEstado(r.id, "confirmada")}
                    disabled={procesando === r.id}
                  >
                    Confirmar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => cambiarEstado(r.id, "cancelada")}
                    disabled={procesando === r.id}
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {confirmadas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-green-600 font-semibold">✅ Confirmadas</h3>
          {confirmadas.map((r) => (
            <Card key={r.id} className="p-4 opacity-80">
              <div>
                <p>
                  <strong>
                    {r.usuario.nombre} {r.usuario.apellido}
                  </strong>{" "}
                  · {obtenerDescripcion(r)}
                </p>
                <Badge label="Confirmada" variant="green" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {canceladas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-red-600 font-semibold">❌ Canceladas / Rechazadas</h3>
          {canceladas.map((r) => (
            <Card key={r.id} className="p-4 opacity-60 bg-gray-100">
              <div>
                <p>
                  <strong>
                    {r.usuario.nombre} {r.usuario.apellido}
                  </strong>{" "}
                  · {obtenerDescripcion(r)}
                </p>
                <Badge label="Cancelada" variant="red" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {reservas.length === 0 && <div className="text-center py-16 text-gray-500">No hay reservas registradas</div>}
    </div>
  );
}