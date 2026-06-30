// ---------- Domain value types (mirror the n8n payload shape) ----------

export interface Municipio {
  municipio: string;
  empleados: number;
  porcentaje: number;
}

export interface Region {
  departamento: string;
  codigoDane: string | null;
  empleados: number;
  porcentaje: number;
  /** Normalised heat-map weight — range [0, 1] */
  intensidad: number;
  municipios: Municipio[];
}

export interface MetaDemografia {
  generadoEn: string;
  fuente: string;
  totalEmpleados: number;
  totalDepartamentos: number;
  registrosInvalidos: number;
}

export interface N8nPayload {
  meta: MetaDemografia;
  regiones: Region[];
}

// ---------- Persistence record (matches DemografiaData Prisma model) ----------

export interface DemografiaData {
  id: string;
  payload: N8nPayload;
  createdAt: Date;
}

// ---------- Repository contract ----------

export interface IDemografiaRepository {
  save(payload: N8nPayload): Promise<DemografiaData>;
  findLatest(): Promise<DemografiaData | null>;
}

// ---------- Service contract ----------

export interface IDemografiaService {
  savePayload(dto: N8nPayload): Promise<DemografiaData>;
  /** Throws 404 AppError when no data has been ingested yet */
  getLatestPayload(): Promise<DemografiaData>;
}
