import { api } from "./api";
import type { Clase, Instructor, Horario, Inscripcion } from "@/types";

export const clasesService = {
  getAll: () => api.get<Clase[]>("/clases"),
  getById: (id: string) => api.get<Clase>(`/clases/${id}`),
  create: (data: Partial<Clase>) => api.post<Clase>("/clases", data),
  update: (id: string, data: Partial<Clase>) =>
    api.put<Clase>(`/clases/${id}`, data),
  delete: (id: string) => api.delete(`/clases/${id}`),
};

export const instructoresService = {
  getAll: () => api.get<Instructor[]>("/instructores"),
  getById: (id: string) => api.get<Instructor>(`/instructores/${id}`),
};

export const horariosService = {
  getAll: () => api.get<Horario[]>("/horarios"),
  getByClase: (claseId: string) =>
    api.get<Horario[]>(`/horarios?claseId=${claseId}`),
  getByFecha: (fecha: string) =>
    api.get<Horario[]>(`/horarios?fecha=${fecha}`),
};

export const inscripcionesService = {
  getMias: () => api.get<Inscripcion[]>("/inscripciones/mis-inscripciones"),
  inscribirse: (horarioId: string) =>
    api.post<Inscripcion>("/inscripciones", { horarioId }),
  cancelar: (id: string) => api.delete(`/inscripciones/${id}`),
};
