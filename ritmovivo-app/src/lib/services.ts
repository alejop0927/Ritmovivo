import { api } from "./api";
import type { Clase, Instructor, Horario, Inscripcion, Reserva, Feedback } from "@/types";

// ---------- Clases ----------
export const clasesService = {
  getAll: () => api.get<Clase[]>("/clases"),
  getById: (id: string) => api.get<Clase>(`/clases/${id}`),
  create: (data: Partial<Clase>) => api.post<Clase>("/clases", data),
  update: (id: string, data: Partial<Clase>) => api.put<Clase>(`/clases/${id}`, data),
  delete: (id: string) => api.delete(`/clases/${id}`),
};

// ---------- Instructores ----------
export const instructoresService = {
  getAll: () => api.get<Instructor[]>("/instructores"),
  getById: (id: string) => api.get<Instructor>(`/instructores/${id}`),
  getMiPerfil: () => api.get<Instructor>("/instructores/mi-perfil"),
};

// ---------- Horarios ----------
export const horariosService = {
  getAll: () => api.get<Horario[]>("/horarios"),
  getByClase: (claseId: string) => api.get<Horario[]>(`/horarios?claseId=${claseId}`),
  getByFecha: (fecha: string) => api.get<Horario[]>(`/horarios?fecha=${fecha}`),
};

// ---------- Inscripciones ----------
export const inscripcionesService = {
  // Estudiante
  solicitar: (horarioId: string) => api.post<Inscripcion>("/inscripciones/solicitar", { horarioId }),
  getMisPendientes: () => api.get<Inscripcion[]>("/inscripciones/mis-pendientes"),
  getMisActivas: () => api.get<Inscripcion[]>("/inscripciones/mis-activas"),
  cancelarActiva: (id: string) => api.delete(`/inscripciones/cancelar/${id}`),
  // Admin
  getSolicitudesPendientes: () => api.get<Inscripcion[]>("/inscripciones/pendientes"),
  aprobar: (id: string) => api.patch<Inscripcion>(`/inscripciones/aprobar/${id}`, {}),
  rechazar: (id: string) => api.patch<Inscripcion>(`/inscripciones/rechazar/${id}`, {}),
  cancelar: (id: string) => api.delete<Inscripcion>(`/inscripciones/${id}`),
  getAll: () => api.get<Inscripcion[]>("/inscripciones/todas"),
  // Instructor
  getByInstructor: () => api.get<Inscripcion[]>("/inscripciones/instructor/mis-inscripciones"),
};

// ---------- Reservas ----------
export const reservasService = {
  getAll: () => api.get<Reserva[]>("/reservas"),
  getMias: () => api.get<Reserva[]>("/reservas/mis-reservas"),
  reservar: (horarioId: string) => api.post<Reserva>("/reservas", { horarioId }),
  cancelar: (id: string) => api.delete(`/reservas/${id}`),
};

// ---------- Feedback ----------
export const feedbackService = {
  getByClase: (claseId: string) => api.get<Feedback[]>(`/feedback/clase/${claseId}`),
  enviar: (data: { claseId: string; puntuacion: number; comentario?: string }) =>
    api.post<Feedback>("/feedback", data),
  eliminar: (id: string) => api.delete(`/feedback/${id}`),
};