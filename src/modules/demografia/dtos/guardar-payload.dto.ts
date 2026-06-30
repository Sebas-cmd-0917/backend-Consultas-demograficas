import { z } from 'zod';

// ---------- Sub-schemas ----------

const municipioSchema = z.object({
  municipio: z.string().min(1, 'municipio is required'),
  empleados: z.number().int().nonnegative('empleados must be ≥ 0'),
  porcentaje: z.number().min(0).max(100, 'porcentaje must be in [0, 100]'),
});

const regionSchema = z.object({
  departamento: z.string().min(1, 'departamento is required'),
  codigoDane: z.string().min(1, 'codigoDane is required').nullable(),
  empleados: z.number().int().nonnegative('empleados must be ≥ 0'),
  porcentaje: z.number().min(0).max(100, 'porcentaje must be in [0, 100]'),
  intensidad: z.number().min(0, 'intensidad min is 0').max(1, 'intensidad max is 1'),
  municipios: z.array(municipioSchema).min(1, 'At least one municipio is required'),
});

const metaSchema = z.object({
  generadoEn: z.string().min(1, 'generadoEn is required'),
  fuente: z.string().min(1, 'fuente is required'),
  totalEmpleados: z.number().int().nonnegative(),
  totalDepartamentos: z.number().int().nonnegative(),
  registrosInvalidos: z.number().int().nonnegative(),
});

// ---------- Root payload schema ----------

export const n8nPayloadSchema = z.object({
  meta: metaSchema,
  regiones: z.array(regionSchema).min(1, 'At least one region is required'),
});

export type N8nPayloadDto = z.infer<typeof n8nPayloadSchema>;
