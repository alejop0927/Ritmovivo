"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import type { User } from "@/types";

const rolColor: Record<string, "purple" | "green" | "gray"> = {
  admin: "purple", instructor: "green", estudiante: "gray",
};

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<User[]>("/usuarios").then(setUsuarios).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = usuarios.filter(u =>
    `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Usuarios</h2>
        <p className="text-gray-500 mt-1">{usuarios.length} usuarios registrados</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Buscar usuario..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />)}</div>
      ) : (
        <Card>
          <div className="space-y-2">
            {filtered.map(u => (
              <div key={u.id} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                    {u.nombre[0]}{u.apellido[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{u.nombre} {u.apellido}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                </div>
                <Badge label={u.rol} variant={rolColor[u.rol] || "gray"} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}