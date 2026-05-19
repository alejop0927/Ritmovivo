export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: "admin" | "instructor" | "estudiante";
  avatar?: string;
  telefono?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Instructor {
  id: string;
  nombre: string;
  apellido: string;
  especialidad: string[];
  bio: string | null;
  avatar?: string;
  experiencia: number;
  rating: number;
}

export interface Clase {
  id: string;
  nombre: string;
  descripcion: string | null;
  instructor: Instructor | null;
  nivel: "principiante" | "intermedio" | "avanzado";
  duracion: number;
  capacidad: number;
  inscritos: number;
  imagen?: string;
  estilo: string;
}

export interface Horario {
  id: string;
  clase: Clase;
  instructor: Instructor | null;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  salon: string;
  disponible: boolean;
}

export interface Inscripcion {
  id: string;
  usuario: User;
  horario: Horario;
  estado: "activa" | "cancelada" | "completada";
  created_at: string;
}

export interface Reserva {
  id: string;
  usuario: User;
  horario: Horario;
  estado: "pendiente" | "confirmada" | "cancelada";
  created_at: string;
}

export interface Feedback {
  id: string;
  usuario: User;
  clase: Clase;
  puntuacion: number;
  comentario: string | null;
  created_at: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}