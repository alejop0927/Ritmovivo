"use client";
import { useEffect, useState } from "react";
import { Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { inscripcionesService } from "@/lib/services";
import type { Inscripcion } from "@/types";

export default function AdminInscripcionesPage() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inscripcionesService.getAll().then(setInscripciones).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCancelar = async (id: string) => {
    if (!confirm("¿Cancelar esta inscripción?")) return;
    try {
      await inscripcionesService.cancelar(id);
      setInscripciones(prev => prev.filter(i => i.id !== id));
      toast.success("Inscripción cancelada");
    } catch {
      toast.error("Error al cancelar");
    }
  };

  const filtered = inscripciones.filter(i =>
    `${i.usuario.nombre} ${i.usuario.apellido} ${i.horario.clase.nombre}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inscripciones</h2>
        <p className="text-gray-500 mt-1">{inscripciones.length} inscripciones en total</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Buscar..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ins => (
            <Card key={ins.id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {ins.usuario.nombre[0]}{ins.usuario.apellido[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{ins.usuario.nombre} {ins.usuario.apellido}</p>
                  <p className="text-xs text-gray-500">{ins.horario.clase.nombre} · {ins.horario.hora_inicio} - {ins.horario.hora_fin}</p>
                  <p className="text-xs text-gray-400">{ins.horario.fecha} · {ins.horario.salon}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge label={ins.estado} variant={ins.estado === "activa" ? "green" : ins.estado === "cancelada" ? "red" : "gray"} />
                <Button size="sm" variant="danger" onClick={() => handleCancelar(ins.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}