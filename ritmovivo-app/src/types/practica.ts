export type EstiloBaile =
  | "bachata"
  | "merengue"
  | "salsa"
  | "joropo"
  | "cumbia"
  | "porro"
  | "tango";

export interface PoseKeypoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface PoseReferencia {
  nombre: string;
  descripcion: string;
  keypoints: Record<string, PoseKeypoint>;
}

export interface FeedbackPose {
  puntuacion: number; // 0-100
  estado: "excelente" | "bien" | "mejorar" | "incorrecto";
  sugerencias: string[];
  articulacionesMal: string[];
}

export interface ModosPractica {
  modo: "camara" | "video";
}

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
  visibility: number;
}
