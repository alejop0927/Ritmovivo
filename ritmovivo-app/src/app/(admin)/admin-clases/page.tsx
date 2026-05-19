"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { clasesService, instructoresService } from "@/lib/services";
import type { Clase, Instructor } from "@/types";

const nivelColor: Record<string, "purple" | "yellow" | "red"> = {
  principiante: "purple", intermedio: "yellow", avanzado: "red",
};

type FormState = {
  nombre: string;
  descripcion: string;
  nivel: string;
  duracion: number;
  capacidad: number;
  estilo: string;
  instructor_id: string;
};

export default function AdminClasesPage() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Clase | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState<FormState>({
    nombre: "", descripcion: "", nivel: "principiante",
    duracion: 60, capacidad: 20, estilo: "", instructor_id: "",
  });

  useEffect(() => {
    Promise.all([
      clasesService.getAll().then(setClases),
      instructoresService.getAll().then(setInstructores),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm({ nombre: "", descripcion: "", nivel: "principiante", duracion: 60, capacidad: 20, estilo: "", instructor_id: "" });
    setEditando(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.nombre || !form.estilo) return toast.error("Nombre y estilo son obligatorios");
    setGuardando(true);
    try {
      const data = {
        ...form,
        instructor_id: form.instructor_id || undefined,
      };
      if (editando) {
        const updated = await clasesService.update(editando.id, data as any);
        setClases(prev => prev.map(c => c.id === editando.id ? updated : c));
        toast.success("Clase actualizada");
      } else {
        const nueva = await clasesService.create(data as any);
        setClases(prev => [...prev, nueva]);
        toast.success("Clase creada");
      }
      resetForm();
    } catch {
      toast.error("Error al guardar la clase");
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = (clase: Clase) => {
    setEditando(clase);
    setForm({
      nombre: clase.nombre,
      descripcion: clase.descripcion ?? "",
      nivel: clase.nivel,
      duracion: clase.duracion,
      capacidad: clase.capacidad,
      estilo: clase.estilo,
      instructor_id: clase.instructor?.id ?? "",
    });
    setShowForm(true);
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Eliminar esta clase?")) return;
    try {
      await clasesService.delete(id);
      setClases(prev => prev.filter(c => c.id !== id));
      toast.success("Clase eliminada");
    } catch (e: any) {
      toast.error(e.message ?? "Error al eliminar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestionar Clases</h2>
          <p className="text-gray-500 mt-1">{clases.length} clases registradas</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Nueva clase
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {editando ? "Editar clase" : "Nueva clase"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
            <Input label="Estilo (ej: Salsa, Bachata)" value={form.estilo} onChange={e => setForm(p => ({ ...p, estilo: e.target.value }))} />
            <Input label="Descripción" value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nivel</label>
              <select
                value={form.nivel}
                onChange={e => setForm(p => ({ ...p, nivel: e.target.value }))}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm"
              >
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Instructor</label>
              <select
                value={form.instructor_id}
                onChange={e => setForm(p => ({ ...p, instructor_id: e.target.value }))}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm"
              >
                <option value="">Sin instructor</option>
                {instructores.map(i => (
                  <option key={i.id} value={i.id}>{i.nombre} {i.apellido}</option>
                ))}
              </select>
            </div>
            <Input label="Duración (min)" type="number" value={form.duracion} onChange={e => setForm(p => ({ ...p, duracion: Number(e.target.value) }))} />
            <Input label="Capacidad" type="number" value={form.capacidad} onChange={e => setForm(p => ({ ...p, capacidad: Number(e.target.value) }))} />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSubmit} loading={guardando}>
              {editando ? "Actualizar" : "Crear clase"}
            </Button>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clases.map(clase => (
            <Card key={clase.id} className="flex flex-col gap-3 p-0 overflow-hidden">
              <div className="h-28 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-4xl">💃</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{clase.nombre}</h3>
                    <p className="text-xs text-gray-500">{clase.estilo}</p>
                  </div>
                  <Badge label={clase.nivel} variant={nivelColor[clase.nivel] || "gray"} />
                </div>
                {clase.instructor && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    👤 {clase.instructor.nombre} {clase.instructor.apellido}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{clase.duracion} min</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{clase.inscritos}/{clase.capacidad}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => handleEditar(clase)}>
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleEliminar(clase.id)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}