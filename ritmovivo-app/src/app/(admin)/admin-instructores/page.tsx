"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Star } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { instructoresService } from "@/lib/services";
import { api } from "@/lib/api";
import type { Instructor, User } from "@/types";

export default function AdminInstructoresPage() {
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Instructor | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    usuario_id: "", nombre: "", apellido: "",
    especialidad: "", bio: "", experiencia: 0, rating: 0,
  });

  useEffect(() => {
    Promise.all([
      instructoresService.getAll().then(setInstructores),
      api.get<User[]>("/usuarios").then(u => setUsuarios(u.filter(x => x.rol === "instructor"))),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm({ usuario_id: "", nombre: "", apellido: "", especialidad: "", bio: "", experiencia: 0, rating: 0 });
    setEditando(null);
    setShowForm(false);
  };

  const handleUsuarioChange = (usuarioId: string) => {
    const u = usuarios.find(x => x.id === usuarioId);
    if (u) {
      setForm(p => ({ ...p, usuario_id: usuarioId, nombre: u.nombre, apellido: u.apellido }));
    } else {
      setForm(p => ({ ...p, usuario_id: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!form.nombre || !form.apellido) return toast.error("Nombre y apellido son obligatorios");
    setGuardando(true);
    try {
      const data = {
        ...form,
        usuario_id: form.usuario_id || undefined,
        especialidad: form.especialidad.split(",").map(s => s.trim()).filter(Boolean),
      };
      if (editando) {
        const updated = await api.put<Instructor>(`/instructores/${editando.id}`, data);
        setInstructores(prev => prev.map(i => i.id === editando.id ? updated : i));
        toast.success("Instructor actualizado");
      } else {
        const nuevo = await api.post<Instructor>("/instructores", data);
        setInstructores(prev => [...prev, nuevo]);
        toast.success("Instructor creado");
      }
      resetForm();
    } catch {
      toast.error("Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = (inst: Instructor) => {
    setEditando(inst);
    setForm({
      usuario_id: (inst as any).usuario_id ?? "",
      nombre: inst.nombre,
      apellido: inst.apellido,
      especialidad: inst.especialidad.join(", "),
      bio: inst.bio ?? "",
      experiencia: inst.experiencia,
      rating: inst.rating,
    });
    setShowForm(true);
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Eliminar este instructor?")) return;
    try {
      await api.delete(`/instructores/${id}`);
      setInstructores(prev => prev.filter(i => i.id !== id));
      toast.success("Instructor eliminado");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestionar Instructores</h2>
          <p className="text-gray-500 mt-1">{instructores.length} instructores registrados</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Nuevo instructor
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {editando ? "Editar instructor" : "Nuevo instructor"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Vincular a usuario con rol instructor
              </label>
              <select
                value={form.usuario_id}
                onChange={e => handleUsuarioChange(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm"
              >
                <option value="">Sin vincular (ingresar manualmente)</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre} {u.apellido} — {u.email}</option>
                ))}
              </select>
            </div>
            <Input label="Nombre" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
            <Input label="Apellido" value={form.apellido} onChange={e => setForm(p => ({ ...p, apellido: e.target.value }))} />
            <Input label="Especialidades (separadas por coma)" value={form.especialidad} onChange={e => setForm(p => ({ ...p, especialidad: e.target.value }))} />
            <Input label="Biografía" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
            <Input label="Años de experiencia" type="number" value={form.experiencia} onChange={e => setForm(p => ({ ...p, experiencia: Number(e.target.value) }))} />
            <Input label="Rating (0-5)" type="number" value={form.rating} onChange={e => setForm(p => ({ ...p, rating: Number(e.target.value) }))} />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSubmit} loading={guardando}>
              {editando ? "Actualizar" : "Crear instructor"}
            </Button>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-gray-200 animate-pulse" />)}
        </div>
      ) : instructores.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No hay instructores registrados</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {instructores.map(inst => (
            <Card key={inst.id} className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold">
                {inst.nombre[0]}{inst.apellido[0]}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{inst.nombre} {inst.apellido}</h3>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{inst.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">· {inst.experiencia} años</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-1">
                {inst.especialidad.map(e => <Badge key={e} label={e} variant="pink" />)}
              </div>
              <div className="flex gap-2 w-full">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditar(inst)}>
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                </Button>
                <Button size="sm" variant="danger" className="flex-1" onClick={() => handleEliminar(inst.id)}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}