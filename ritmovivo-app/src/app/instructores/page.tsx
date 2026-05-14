"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { instructoresService } from "@/lib/services";
import type { Instructor } from "@/types";

export default function InstructoresPage() {
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    instructoresService
      .getAll()
      .then(setInstructores)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout title="Instructores">
      <div className="space-y-6">
        <p className="text-gray-500 dark:text-gray-400">
          Conoce a nuestro equipo de instructores profesionales
        </p>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-56 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {instructores.map((inst) => (
              <Card key={inst.id} className="flex flex-col items-center text-center gap-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
                  {inst.nombre[0]}{inst.apellido[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {inst.nombre} {inst.apellido}
                  </h3>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {inst.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400">
                      · {inst.experiencia} años exp.
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                  {inst.bio}
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {inst.especialidad.map((esp) => (
                    <Badge key={esp} label={esp} variant="pink" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
