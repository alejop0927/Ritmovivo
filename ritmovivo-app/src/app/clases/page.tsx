"use client";

import { useEffect, useState } from "react";
import { Search, Clock, Users } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { clasesService } from "@/lib/services";
import type { Clase } from "@/types";

const nivelColor: Record<string, "purple" | "yellow" | "red"> = {
  principiante: "purple",
  intermedio: "yellow",
  avanzado: "red",
};

export default function ClasesPage() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clasesService
      .getAll()
      .then(setClases)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = clases.filter(
    (c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.estilo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Clases">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar clases..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            No se encontraron clases
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((clase) => (
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
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {clase.estilo}
                      </p>
                    </div>
                    <Badge
                      label={clase.nivel}
                      variant={nivelColor[clase.nivel] || "gray"}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {clase.descripcion}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {clase.duracion} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {clase.inscritos}/{clase.capacidad}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Instructor: {clase.instructor.nombre} {clase.instructor.apellido}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
