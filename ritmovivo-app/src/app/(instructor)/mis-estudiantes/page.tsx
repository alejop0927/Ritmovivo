"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Inscripcion } from "@/types";

type EstudianteAgrupado = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  clases: string[];
};

export default function MisEstudiantesPage() {
  const { user } = useAuth();
  const [estudiantes, setEstudiantes] = useState<EstudianteAgrupado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Endpoint específico para instructor: devuelve inscripciones activas de sus clases
    api
      .get<Inscripcion[]>("/inscripciones/instructor/mis-inscripciones")
      .then((inscripciones) => {
        // Agrupar por estudiante y recolectar nombres de clases
        const mapa = new Map<string, EstudianteAgrupado>();
        inscripciones.forEach((ins) => {
          const estudiante = ins.usuario;
          const claseNombre = ins.horario.clase.nombre;
          if (!mapa.has(estudiante.id)) {
            mapa.set(estudiante.id, {
              id: estudiante.id,
              nombre: estudiante.nombre,
              apellido: estudiante.apellido,
              email: estudiante.email,
              clases: [],
            });
          }
          const entry = mapa.get(estudiante.id)!;
          if (!entry.clases.includes(claseNombre)) {
            entry.clases.push(claseNombre);
          }
        });
        setEstudiantes(Array.from(mapa.values()));
      })
      .catch((err) => {
        console.error("Error cargando estudiantes:", err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (estudiantes.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Estudiantes</h2>
          <p className="text-gray-500 mt-1">Aún no tienes estudiantes matriculados</p>
        </div>
        <div className="text-center py-16 text-gray-500">No hay estudiantes inscritos en tus clases.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Estudiantes</h2>
        <p className="text-gray-500 mt-1">{estudiantes.length} estudiantes matriculados en tus clases</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {estudiantes.map((est) => (
          <Card key={est.id} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
                {est.nombre[0]}{est.apellido[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {est.nombre} {est.apellido}
                </p>
                <p className="text-xs text-gray-500">{est.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {est.clases.map((clase) => (
                <Badge key={clase} label={clase} variant="purple" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}