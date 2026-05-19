"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { clasesService, instructoresService } from "@/lib/services";
import type { Horario, Clase, Instructor } from "@/types";

export default function AdminHorariosPage() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    clase_id: "", instructor_id: "", fecha: "",
    hora_inicio: "", hora_fin: "", salon: "", disponible: true,
  });

  useEffect(() => {
    Promise.all([
      api.get<Horario[]>("/horarios").then(setHorarios),
      clasesService.getAll().then(setClases),
      instructoresService.getAll().then(setInstructores),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!form.clase_id || !form.fecha || !form.hora_inicio || !form.hora_fin || !form.salon) {
      return toast.error("Todos los campos son obligatorios");
    }
    setGuardando(true);
    try {
      const nuevo = await api.post<Horario>("/horarios", form);
      setHorarios(prev => [...prev, nuevo]);
      toast.success("Horario creado");
      setShowForm(false);
      setForm({ clase_id: "", instructor_id: "", fecha: "", hora_inicio: "", hora_fin: "", salon: "", disponible: true });
    } catch {
      toast.error("Error al crear horario");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Eliminar este horario?")) return;
    try {
      await api.delete(`/horarios/${id}`);
      setHorarios(prev => prev.filter(h => h.id !== id));
      toast.success("Horario eliminado");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestionar Horarios</h2>
          <p className="text-gray-500 mt-1">{horarios.length} horarios registrados</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> Nuevo horario
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Nuevo horario</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Clase</label>
              <select
                value={form.clase_id}
                onChange={e => setForm(p => ({ ...p, clase_id: e.target.value }))}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm"
              >
                <option value="">Seleccionar clase...</option>
                {clases.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Instructor</label>
              <select
                value={form.instructor_id}
                onChange={e => setForm(p => ({ ...p, instructor_id: e.target.value }))}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm"
              >
                <option value="">Seleccionar instructor...</option>
                {instructores.map(i => <option key={i.id} value={i.id}>{i.nombre} {i.apellido}</option>)}
              </select>
            </div>
            <Input label="Fecha" type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} />
            <Input label="Salón" value={form.salon} onChange={e => setForm(p => ({ ...p, salon: e.target.value }))} />
            <Input label="Hora inicio" type="time" value={form.hora_inicio} onChange={e => setForm(p => ({ ...p, hora_inicio: e.target.value }))} />
            <Input label="Hora fin" type="time" value={form.hora_fin} onChange={e => setForm(p => ({ ...p, hora_fin: e.target.value }))} />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSubmit} loading={guardando}>Crear horario</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-gray-200 animate-pulse" />)}</div>
      ) : horarios.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No hay horarios creados aún</div>
      ) : (
        <div className="space-y-3">
          {horarios.map(h => (
            <Card key={h.id} className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{h.clase.nombre}</h3>
                  <Badge label={h.disponible ? "Disponible" : "Lleno"} variant={h.disponible ? "green" : "red"} />
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{h.fecha}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{h.hora_inicio} - {h.hora_fin}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{h.salon}</span>
                </div>
                {h.instructor && <p className="text-xs text-gray-400">Instructor: {h.instructor.nombre} {h.instructor.apellido}</p>}
              </div>
              <Button size="sm" variant="danger" onClick={() => handleEliminar(h.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}