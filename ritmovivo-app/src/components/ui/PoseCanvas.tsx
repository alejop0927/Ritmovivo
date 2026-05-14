"use client";

import { useEffect, useRef } from "react";
import type { LandmarkPoint } from "@/types/practica";

interface PoseCanvasProps {
  landmarks: LandmarkPoint[];
  articulacionesMal: string[];
  width: number;
  height: number;
}

const CONEXIONES_IDX: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28],
];

const MAL_IDX: Record<string, number[]> = {
  hombro_izq: [11], hombro_der: [12],
  codo_izq: [13], codo_der: [14],
  muñeca_izq: [15], muñeca_der: [16],
  cadera_izq: [23], cadera_der: [24],
  rodilla_izq: [25], rodilla_der: [26],
  tobillo_izq: [27], tobillo_der: [28],
};

export function PoseCanvas({ landmarks, articulacionesMal, width, height }: PoseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || landmarks.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const malIdxSet = new Set(
      articulacionesMal.flatMap((nombre) => MAL_IDX[nombre] || [])
    );

    // Conexiones
    for (const [a, b] of CONEXIONES_IDX) {
      const lmA = landmarks[a];
      const lmB = landmarks[b];
      if (!lmA || !lmB) continue;
      if ((lmA.visibility ?? 1) < 0.4 || (lmB.visibility ?? 1) < 0.4) continue;

      ctx.beginPath();
      ctx.moveTo(lmA.x * width, lmA.y * height);
      ctx.lineTo(lmB.x * width, lmB.y * height);
      ctx.strokeStyle =
        malIdxSet.has(a) || malIdxSet.has(b)
          ? "rgba(239,68,68,0.85)"
          : "rgba(34,197,94,0.85)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // Nodos
    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      if (!lm || (lm.visibility ?? 1) < 0.4) continue;
      ctx.beginPath();
      ctx.arc(lm.x * width, lm.y * height, 5, 0, Math.PI * 2);
      ctx.fillStyle = malIdxSet.has(i)
        ? "rgba(239,68,68,0.9)"
        : "rgba(34,197,94,0.9)";
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [landmarks, articulacionesMal, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
    />
  );
}
