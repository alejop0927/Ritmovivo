"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

export default function ReservarPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    salon: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    numero_personas: 1,
    con_profesor: false,
  });

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.salon.trim()) {
      toast.error("El nombre del salón o espacio es obligatorio");
      return;
    }
    if (!form.fecha) {
      toast.error("La fecha es obligatoria");
      return;
    }
    const selectedDate = new Date(form.fecha);
    const todayDate = new Date();
    todayDate.setUTCHours(0, 0, 0, 0);
    selectedDate.setUTCHours(0, 0, 0, 0);
    if (selectedDate < todayDate) {
      toast.error("No se puede reservar en una fecha pasada");
      return;
    }
    if (!form.hora_inicio || !form.hora_fin) {
      toast.error("Las horas son obligatorias");
      return;
    }
    if (form.hora_inicio >= form.hora_fin) {
      toast.error("La hora de inicio debe ser anterior a la hora de fin");
      return;
    }

    setLoading(true);
    try {
      await api.post("/reservas", {
        salon: form.salon,
        fecha: form.fecha,
        hora_inicio: form.hora_inicio,
        hora_fin: form.hora_fin,
        numero_personas: form.numero_personas,
        con_profesor: form.con_profesor,
      });
      toast.success("✅ Solicitud de reserva enviada. Espera confirmación del administrador.");
      setForm({
        salon: "",
        fecha: "",
        hora_inicio: "",
        hora_fin: "",
        numero_personas: 1,
        con_profesor: false,
      });
    } catch (err: any) {
      const mensaje = err?.response?.data?.message || err?.message || "Error al enviar reserva";
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reservar un espacio</h2>
        <p className="text-gray-500">Complete el formulario para reservar un salón o espacio</p>
      </div>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Salón / Espacio *"
            value={form.salon}
            onChange={(e) => setForm({ ...form, salon: e.target.value })}
            required
          />
          <Input
            label="Fecha *"
            type="date"
            min={today}
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hora inicio *"
              type="time"
              value={form.hora_inicio}
              onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
              required
            />
            <Input
              label="Hora fin *"
              type="time"
              value={form.hora_fin}
              onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
              required
            />
          </div>
          <Input
            label="Número de personas"
            type="number"
            min="1"
            value={form.numero_personas}
            onChange={(e) => setForm({ ...form, numero_personas: parseInt(e.target.value) || 1 })}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="conProfesor"
              checked={form.con_profesor}
              onChange={(e) => setForm({ ...form, con_profesor: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="conProfesor" className="text-sm">
              Requiere instructor / profesor
            </label>
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Enviar solicitud
          </Button>
        </form>
      </Card>
    </div>
  );
}