// Tipos para el módulo de Planificación de Talleres

// Tipos de talleres predefinidos
export type WorkshopType =
  | 'LECTURA_DIVERTIDA'
  | 'MATEMATICA_FASCINA'
  | 'CATEDRA_CIUDADANA'
  | 'EDUCACION_AMBIENTAL'
  | 'PERSONALIZADO';

export type WorkshopStatus = 'activo' | 'completado' | 'archivado';
export type SessionStatus = 'pendiente' | 'completada';

// Taller principal
export interface Workshop {
  id: string;
  docente_id: string;
  nombre: string;
  descripcion: string;
  tipo_taller: WorkshopType;
  nivel: 'inicial' | 'primaria' | 'secundaria';
  grado: string;
  competencias_especificas: string[];
  indicadores: string[];
  color: string;
  icono: string;
  gradiente: string;
  max_clases: number;
  estado: WorkshopStatus;
  sesiones: WorkshopSession[];
  creado_en: string;
  actualizado_en: string;
}

// Sesión / Clase dentro de un taller
export interface WorkshopSession {
  id: string;
  taller_id: string;
  numero_clase: number;
  titulo: string;
  tema: string;
  objetivo: string;
  competencia_especifica: string;
  indicadores_logro: string[];
  contenidos: {
    conceptual: string;
    procedimental: string;
    actitudinal: string;
    competencias_fundamentales?: string[];
  };
  momentos: {
    inicio: string;
    desarrollo: string;
    cierre: string;
  };
  recursos: string[];
  evaluacion: string;
  duracion_minutos: number;
  fecha: string;
  estado: SessionStatus;
  creado_en: string;
}

// Plantilla de taller predefinido
export interface WorkshopTemplate {
  tipo: WorkshopType;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  gradiente: string;
  competencias_por_nivel: Record<string, string[]>;
  indicadores_por_nivel: Record<string, string[]>;
  temas_sugeridos: string[];
}
