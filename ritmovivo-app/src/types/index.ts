export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: "admin" | "instructor" | "estudiante";
  avatar?: string;
  telefono?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Clase {
  id: string;
  nombre: string;
  descripcion: string;
  instructor: Instructor;
  nivel: "principiante" | "intermedio" | "avanzado";
  duracion: number;
  capacidad: number;
  inscritos: number;
  imagen?: string;
  estilo: string;
}

export interface Instructor {
  id: string;
  nombre: string;
  apellido: string;
  especialidad: string[];
  bio: string;
  avatar?: string;
  experiencia: number;
  rating: number;
}

export interface Horario {
  id: string;
  clase: Clase;
  instructor: Instructor;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  salon: string;
  disponible: boolean;
}

export interface Inscripcion {
  id: string;
  usuario: User;
  horario: Horario;
  estado: "activa" | "cancelada" | "completada";
  fechaInscripcion: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
