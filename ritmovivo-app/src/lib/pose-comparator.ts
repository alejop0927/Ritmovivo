import type { LandmarkPoint, FeedbackPose, PoseReferencia } from "@/types/practica";

const LANDMARK_NAMES: Record<number, string> = {
  11: "hombro_izq",
  12: "hombro_der",
  13: "codo_izq",
  14: "codo_der",
  15: "muñeca_izq",
  16: "muñeca_der",
  23: "cadera_izq",
  24: "cadera_der",
  25: "rodilla_izq",
  26: "rodilla_der",
  27: "tobillo_izq",
  28: "tobillo_der",
};

const SUGERENCIAS: Record<string, string> = {
  hombro_izq: "Ajusta el hombro izquierdo",
  hombro_der: "Ajusta el hombro derecho",
  codo_izq: "Corrige el codo izquierdo",
  codo_der: "Corrige el codo derecho",
  muñeca_izq: "Mueve el brazo izquierdo",
  muñeca_der: "Mueve el brazo derecho",
  cadera_izq: "Ajusta la cadera izquierda",
  cadera_der: "Ajusta la cadera derecha",
  rodilla_izq: "Corrige la rodilla izquierda",
  rodilla_der: "Corrige la rodilla derecha",
  tobillo_izq: "Reposiciona el pie izquierdo",
  tobillo_der: "Reposiciona el pie derecho",
};

function distancia(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export function compararPose(
  landmarks: LandmarkPoint[],
  referencia: PoseReferencia
): FeedbackPose {
  const articulacionesMal: string[] = [];
  let totalScore = 0;
  let count = 0;
  const UMBRAL = 0.12;

  for (const [idx, nombre] of Object.entries(LANDMARK_NAMES)) {
    const ref = referencia.keypoints[nombre];
    const lm = landmarks[Number(idx)];

    if (!ref || !lm || (lm.visibility !== undefined && lm.visibility < 0.5))
      continue;

    const dist = distancia({ x: lm.x, y: lm.y }, ref);
    const score = Math.max(0, 1 - dist / UMBRAL);
    totalScore += score;
    count++;

    if (dist > UMBRAL) {
      articulacionesMal.push(nombre);
    }
  }

  const puntuacion = count > 0 ? Math.round((totalScore / count) * 100) : 0;

  const estado =
    puntuacion >= 85
      ? "excelente"
      : puntuacion >= 65
      ? "bien"
      : puntuacion >= 40
      ? "mejorar"
      : "incorrecto";

  const sugerencias = articulacionesMal
    .slice(0, 3)
    .map((a) => SUGERENCIAS[a] || `Ajusta ${a}`);

  if (sugerencias.length === 0 && puntuacion >= 85) {
    sugerencias.push("¡Perfecto! Mantén esa postura");
  }

  return { puntuacion, estado, sugerencias, articulacionesMal };
}

export function getLandmarkMap(
  landmarks: LandmarkPoint[]
): Record<string, LandmarkPoint> {
  const map: Record<string, LandmarkPoint> = {};
  for (const [idx, nombre] of Object.entries(LANDMARK_NAMES)) {
    const lm = landmarks[Number(idx)];
    if (lm) map[nombre] = lm;
  }
  return map;
}

export { LANDMARK_NAMES };
