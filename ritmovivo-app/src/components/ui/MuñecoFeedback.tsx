"use client";

import type { PoseReferencia } from "@/types/practica";

interface MuñecoFeedbackProps {
  referencia: PoseReferencia;
  articulacionesMal: string[];
  puntuacion: number;
}

const CONEXIONES: [string, string][] = [
  ["hombro_izq", "hombro_der"],
  ["hombro_izq", "codo_izq"],
  ["codo_izq", "muñeca_izq"],
  ["hombro_der", "codo_der"],
  ["codo_der", "muñeca_der"],
  ["hombro_izq", "cadera_izq"],
  ["hombro_der", "cadera_der"],
  ["cadera_izq", "cadera_der"],
  ["cadera_izq", "rodilla_izq"],
  ["rodilla_izq", "tobillo_izq"],
  ["cadera_der", "rodilla_der"],
  ["rodilla_der", "tobillo_der"],
];

export function MuñecoFeedback({
  referencia,
  articulacionesMal,
  puntuacion,
}: MuñecoFeedbackProps) {
  const kp = referencia.keypoints;
  const W = 160;
  const H = 220;

  const toSVG = (x: number, y: number) => ({
    cx: x * W,
    cy: y * H,
  });

  const colorNodo = (nombre: string) =>
    articulacionesMal.includes(nombre) ? "#ef4444" : "#22c55e";

  const colorLinea = (a: string, b: string) =>
    articulacionesMal.includes(a) || articulacionesMal.includes(b)
      ? "#ef4444"
      : "#22c55e";

  const estadoColor =
    puntuacion >= 85
      ? "text-green-400"
      : puntuacion >= 65
      ? "text-yellow-400"
      : puntuacion >= 40
      ? "text-orange-400"
      : "text-red-400";

  const estadoLabel =
    puntuacion >= 85
      ? "¡Excelente!"
      : puntuacion >= 65
      ? "¡Bien!"
      : puntuacion >= 40
      ? "Mejorar"
      : "Incorrecto";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="rounded-xl bg-gray-800/80"
      >
        {/* Cabeza */}
        {kp["hombro_izq"] && kp["hombro_der"] && (
          <circle
            cx={((kp["hombro_izq"].x + kp["hombro_der"].x) / 2) * W}
            cy={((kp["hombro_izq"].y + kp["hombro_der"].y) / 2) * H - 22}
            r={12}
            fill="#a78bfa"
            stroke="#7c3aed"
            strokeWidth={2}
          />
        )}

        {/* Conexiones */}
        {CONEXIONES.map(([a, b]) => {
          const pa = kp[a];
          const pb = kp[b];
          if (!pa || !pb) return null;
          const { cx: x1, cy: y1 } = toSVG(pa.x, pa.y);
          const { cx: x2, cy: y2 } = toSVG(pb.x, pb.y);
          return (
            <line
              key={`${a}-${b}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={colorLinea(a, b)}
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        })}

        {/* Nodos */}
        {Object.entries(kp).map(([nombre, punto]) => {
          const { cx, cy } = toSVG(punto.x, punto.y);
          return (
            <circle
              key={nombre}
              cx={cx}
              cy={cy}
              r={5}
              fill={colorNodo(nombre)}
              stroke="white"
              strokeWidth={1.5}
            />
          );
        })}
      </svg>

      <div className="text-center">
        <p className={`text-2xl font-bold ${estadoColor}`}>{puntuacion}%</p>
        <p className={`text-sm font-medium ${estadoColor}`}>{estadoLabel}</p>
      </div>
    </div>
  );
}
