"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { inscripcionesService } from "@/lib/services";
import type { Inscripcion } from "@/types";

const schema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  telefono: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const estadoColor: Record<string, "green" | "red" | "gray"> = {
  activa: "green", cancelada: "red", completada: "gray",
};

export default function PerfilEstudiantePage() {
  const { user } = useAuth();
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) reset({ nombre: user.nombre, apellido: user.apellido, telefono: user.telefono ?? "" });
    // ✅ Cambio: getMias() → getMisActivas()
    inscripcionesService.getMisActivas().then(setInscripciones).catch(() => {});
  }, [user, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await api.put(`/usuarios/${user?.id}`, data);
      toast.success("Perfil actualizado");
    } catch {
      toast.error("Error al actualizar el perfil");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mi Perfil</h2>
        <p className="text-gray-500 mt-1">Gestiona tu información personal</p>
      </div>
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
            {user?.nombre?.[0]}{user?.apellido?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.nombre} {user?.apellido}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <Badge label="Estudiante" variant="purple" />
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre" error={errors.nombre?.message} {...register("nombre")} />
            <Input label="Apellido" error={errors.apellido?.message} {...register("apellido")} />
          </div>
          <Input label="Teléfono" type="tel" {...register("telefono")} />
          <Button type="submit" loading={isSubmitting}>Guardar cambios</Button>
        </form>
      </Card>
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Historial de inscripciones</h3>
        {inscripciones.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No tienes inscripciones activas</p>
        ) : (
          <div className="space-y-3">
            {inscripciones.map(ins => (
              <div key={ins.id} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{ins.horario.clase.nombre}</p>
                  <p className="text-xs text-gray-500">{ins.horario.fecha} · {ins.horario.hora_inicio}</p>
                </div>
                <Badge label={ins.estado} variant={estadoColor[ins.estado] || "gray"} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}