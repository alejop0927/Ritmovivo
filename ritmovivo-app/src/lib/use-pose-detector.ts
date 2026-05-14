"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { LandmarkPoint } from "@/types/practica";

interface UsePoseDetectorOptions {
  onLandmarks: (landmarks: LandmarkPoint[]) => void;
}

export function usePoseDetector({ onLandmarks }: UsePoseDetectorOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const poseLandmarkerRef = useRef<unknown>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(-1);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { PoseLandmarker, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });

        if (!cancelled) {
          poseLandmarkerRef.current = landmarker;
          setReady(true);
        }
      } catch {
        if (!cancelled) setError("No se pudo cargar el detector de pose");
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setRunning(true);
    } catch {
      setError("No se pudo acceder a la cámara");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    cancelAnimationFrame(animFrameRef.current);
    setRunning(false);
    lastTimeRef.current = -1;
  }, []);

  const loadVideo = useCallback((file: File) => {
    if (!videoRef.current) return;
    const url = URL.createObjectURL(file);
    videoRef.current.src = url;
    videoRef.current.load();
    setRunning(false);
  }, []);

  // Loop de detección
  useEffect(() => {
    if (!ready || !running) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const landmarker = poseLandmarkerRef.current as any;
    if (!landmarker) return;

    const detect = (time: number) => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      if (time !== lastTimeRef.current) {
        lastTimeRef.current = time;
        try {
          const result = landmarker.detectForVideo(video, time);
          if (result.landmarks?.[0]) {
            onLandmarks(result.landmarks[0] as LandmarkPoint[]);
          }
        } catch {
          // frame skip
        }
      }

      animFrameRef.current = requestAnimationFrame(detect);
    };

    animFrameRef.current = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [ready, running, onLandmarks]);

  const startVideoDetection = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.play();
    setRunning(true);
  }, []);

  return {
    videoRef,
    ready,
    error,
    running,
    startCamera,
    stopCamera,
    loadVideo,
    startVideoDetection,
  };
}
