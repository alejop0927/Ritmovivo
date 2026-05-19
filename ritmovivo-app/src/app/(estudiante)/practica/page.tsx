"use client";

import { useState, useCallback, useRef } from "react";
import { Camera, Video, Upload, Play, Square, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MuñecoFeedback } from "@/components/ui/MuñecoFeedback";
import { PoseCanvas } from "@/components/ui/PoseCanvas";
import { usePoseDetector } from "@/lib/use-pose-detector";
import { compararPose } from "@/lib/pose-comparator";
import { POSES_REFERENCIA, ESTILOS_INFO } from "@/lib/poses-referencia";
import type { EstiloBaile } from "@/types/practica";
import type { FeedbackPose, LandmarkPoint } from "@/types/practica";

const ESTILOS = Object.keys(POSES_REFERENCIA) as EstiloBaile[];

const VIDEO_W = 640;
const VIDEO_H = 480;

export default function PracticaPage() {
  const [modo, setModo] = useState<"camara" | "video">("camara");
  const [estiloSeleccionado, setEstiloSeleccionado] = useState<EstiloBaile>("salsa");
  const [pasoIdx, setPasoIdx] = useState(0);
  const [landmarks, setLandmarks] = useState<LandmarkPoint[]>([]);
  const [feedback, setFeedback] = useState<FeedbackPose | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const poses = POSES_REFERENCIA[estiloSeleccionado];
  const pasoActual = poses[pasoIdx] ?? poses[0];
  const info = ESTILOS_INFO[estiloSeleccionado];

  const handleLandmarks = useCallback(
    (lms: LandmarkPoint[]) => {
      setLandmarks(lms);
      const fb = compararPose(lms, pasoActual);
      setFeedback(fb);
    },
    [pasoActual]
  );

  const { videoRef, ready, error, running, startCamera, stopCamera, loadVideo, startVideoDetection } =
    usePoseDetector({ onLandmarks: handleLandmarks });

  const handleEstilo = (e: EstiloBaile) => {
    setEstiloSeleccionado(e);
    setPasoIdx(0);
    setFeedback(null);
    setLandmarks([]);
    if (running) stopCamera();
  };

  const handleFileChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (file) loadVideo(file);
  };

  const estadoBadge = feedback
    ? feedback.estado === "excelente"
      ? "green"
      : feedback.estado === "bien"
      ? "purple"
      : feedback.estado === "mejorar"
      ? "yellow"
      : "red"
    : "gray";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Práctica con IA 🤖
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Detectamos tu pose en tiempo real y te damos feedback instantáneo
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={modo === "camara" ? "primary" : "outline"}
            size="sm"
            onClick={() => { setModo("camara"); if (running) stopCamera(); }}
          >
            <Camera className="w-4 h-4" /> Cámara
          </Button>
          <Button
            variant={modo === "video" ? "primary" : "outline"}
            size="sm"
            onClick={() => { setModo("video"); if (running) stopCamera(); }}
          >
            <Video className="w-4 h-4" /> Video
          </Button>
        </div>
      </div>

      {/* Selector de estilos */}
      <div className="flex flex-wrap gap-2">
        {ESTILOS.map((e) => {
          const inf = ESTILOS_INFO[e];
          return (
            <button
              key={e}
              onClick={() => handleEstilo(e)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all border ${
                estiloSeleccionado === e
                  ? `bg-gradient-to-r ${inf.color} text-white border-transparent shadow-md`
                  : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-400"
              }`}
            >
              <span>{inf.emoji}</span>
              <span className="capitalize">{e}</span>
            </button>
          );
        })}
      </div>

      {/* Info del estilo */}
      <Card className="flex items-center gap-4 py-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-2xl`}>
          {info.emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
              {estiloSeleccionado}
            </h3>
            <Badge label={info.origen} variant="purple" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Paso: <span className="font-medium text-gray-700 dark:text-gray-200">{pasoActual.nombre}</span>
            {" — "}{pasoActual.descripcion}
          </p>
        </div>
        {poses.length > 1 && (
          <div className="flex gap-1">
            <button
              onClick={() => setPasoIdx((i) => Math.max(0, i - 1))}
              disabled={pasoIdx === 0}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
              {pasoIdx + 1}/{poses.length}
            </span>
            <button
              onClick={() => setPasoIdx((i) => Math.min(poses.length - 1, i + 1))}
              disabled={pasoIdx === poses.length - 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </Card>

      {/* Área principal */}
      <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
        {/* Video / Cámara */}
        <div className="space-y-3">
          <div
            className="relative rounded-2xl overflow-hidden bg-gray-900"
            style={{ aspectRatio: `${VIDEO_W}/${VIDEO_H}` }}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover scale-x-[-1]"
              playsInline
              muted={modo === "camara"}
            />
            {landmarks.length > 0 && (
              <div className="absolute inset-0" style={{ transform: "scaleX(-1)" }}>
                <PoseCanvas
                  landmarks={landmarks}
                  articulacionesMal={feedback?.articulacionesMal ?? []}
                  width={VIDEO_W}
                  height={VIDEO_H}
                />
              </div>
            )}

            {!running && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-900/80">
                {!ready ? (
                  <div className="flex flex-col items-center gap-2 text-white">
                    <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm">Cargando detector de pose...</p>
                  </div>
                ) : error ? (
                  <p className="text-red-400 text-sm">{error}</p>
                ) : modo === "camara" ? (
                  <Button onClick={startCamera} size="lg">
                    <Camera className="w-5 h-5" /> Activar cámara
                  </Button>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="lg">
                      <Upload className="w-5 h-5" /> Subir video de coreografía
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button onClick={startVideoDetection} size="lg">
                      <Play className="w-5 h-5" /> Analizar video
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Puntuación flotante */}
            {feedback && running && (
              <div className="absolute top-3 left-3 bg-black/60 rounded-xl px-3 py-1.5 backdrop-blur-sm">
                <span className={`text-lg font-bold ${
                  feedback.puntuacion >= 85 ? "text-green-400" :
                  feedback.puntuacion >= 65 ? "text-yellow-400" :
                  feedback.puntuacion >= 40 ? "text-orange-400" : "text-red-400"
                }`}>
                  {feedback.puntuacion}%
                </span>
              </div>
            )}
          </div>

          {/* Controles */}
          {running && (
            <div className="flex gap-2">
              <Button variant="danger" size="sm" onClick={stopCamera}>
                <Square className="w-4 h-4" /> Detener
              </Button>
              {modo === "video" && (
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4" /> Cambiar video
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Panel de feedback con muñeco */}
        <div className="space-y-4">
          <Card className="flex flex-col items-center gap-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 self-start">
              Tu postura
            </h4>
            <MuñecoFeedback
              referencia={pasoActual}
              articulacionesMal={feedback?.articulacionesMal ?? []}
              puntuacion={feedback?.puntuacion ?? 0}
            />
            {feedback && (
              <Badge
                label={feedback.estado.charAt(0).toUpperCase() + feedback.estado.slice(1)}
                variant={estadoBadge as "green" | "purple" | "yellow" | "red" | "gray"}
              />
            )}
          </Card>

          {/* Sugerencias */}
          <Card>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Sugerencias
            </h4>
            {!feedback || feedback.sugerencias.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {running ? "Analizando tu pose..." : "Activa la cámara para recibir feedback"}
              </p>
            ) : (
              <ul className="space-y-2">
                {feedback.sugerencias.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">{s}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Referencia visual del paso */}
          <Card>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Pose objetivo
            </h4>
            <MuñecoFeedback
              referencia={pasoActual}
              articulacionesMal={[]}
              puntuacion={100}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              {pasoActual.descripcion}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}