"use client";
import { useEffect, useState } from "react";
import { Clock, Users, Eye, X, RefreshCw, Video } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Clase, Inscripcion } from "@/types";

const nivelColor: Record<string, "purple" | "yellow" | "red"> = {
  principiante: "purple",
  intermedio: "yellow",
  avanzado: "red",
};

export default function MisClasesInstructorPage() {
  const { user } = useAuth();
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [claseVer, setClaseVer] = useState<Clase | null>(null);
  const [inscripcionesClase, setInscripcionesClase] = useState<Inscripcion[]>([]);
  const [cargandoInscritos, setCargandoInscritos] = useState(false);

  const cargarClases = () => {
    setLoading(true);
    api
      .get<{ id: string }>("/instructores/mi-perfil")
      .then((perfil) =>
        api.get<Clase[]>("/clases").then((todas) =>
          setClases(todas.filter((c) => c.instructor?.id === perfil.id))
        )
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarClases();
  }, [user]);

  const handleVerEstudiantes = async (clase: Clase) => {
    setClaseVer(clase);
    setCargandoInscritos(true);
    try {
      const todas = await api.get<Inscripcion[]>("/inscripciones/instructor/mis-inscripciones");
      const filtradas = todas.filter((ins) => ins.horario.clase.id === clase.id);
      setInscripcionesClase(filtradas);
    } catch (error) {
      console.error(error);
      setInscripcionesClase([]);
    } finally {
      setCargandoInscritos(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Clases</h2>
          <p className="text-gray-500 mt-1">Clases que tienes asignadas</p>
        </div>
        <Button variant="outline" size="sm" onClick={cargarClases}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refrescar
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-56 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      ) : clases.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No tienes clases asignadas aún</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clases.map((clase) => (
            <Card key={clase.id} className="flex flex-col gap-3 p-0 overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
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
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{clase.descripcion}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {clase.duracion} min</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {clase.inscritos}/{clase.capacidad}</span>
                </div>
                <Button size="sm" variant="outline" className="w-full" onClick={() => handleVerEstudiantes(clase)}>
                  <Eye className="w-3.5 h-3.5 mr-1.5" /> Ver estudiantes inscritos
                </Button>
                
<Button
  size="sm"
  variant="primary"
  className="w-full mt-2"
  onClick={() => window.location.href = `/clase-virtual/${clase.id}?rol=instructor`}
>
  <Video className="w-3.5 h-3.5 mr-1.5" /> Iniciar clase virtual
</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de estudiantes inscritos */}
      {claseVer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{claseVer.nombre}</h3>
                <p className="text-sm text-gray-500">Estudiantes matriculados</p>
              </div>
              <button onClick={() => setClaseVer(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {cargandoInscritos ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />)}
                </div>
              ) : inscripcionesClase.length === 0 ? (
                <p className="text-center py-10 text-gray-500 text-sm">No hay estudiantes inscritos en esta clase aún</p>
              ) : (
                <div className="space-y-3">
                  {inscripcionesClase.map((ins) => (
                    <div key={ins.id} className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {ins.usuario.nombre[0]}{ins.usuario.apellido[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{ins.usuario.nombre} {ins.usuario.apellido}</p>
                          <p className="text-xs text-gray-500">{ins.horario.hora_inicio} - {ins.horario.hora_fin} · {ins.horario.salon}</p>
                        </div>
                      </div>
                      <Badge
                        label={ins.estado}
                        variant={ins.estado === "activa" ? "green" : ins.estado === "completada" ? "purple" : "red"}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-400 text-center">{inscripcionesClase.length} estudiante(s) en total</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}