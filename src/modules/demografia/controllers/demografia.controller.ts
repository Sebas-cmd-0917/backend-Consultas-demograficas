import { Request, Response, NextFunction } from 'express';
import { IDemografiaService } from '../interfaces/demografia.interface';
import { n8nPayloadSchema } from '../dtos/guardar-payload.dto';

export class DemografiaController {
  constructor(private readonly service: IDemografiaService) {}

  /**
   * POST /api/demografia
   * Ingestion endpoint called by the n8n pipeline.
   * Validates the payload strictly before persisting.
   */
  receiveFromN8n = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto = n8nPayloadSchema.parse(req.body);
      const saved = await this.service.savePayload(dto);
      res.status(201).json({ success: true, data: saved });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/demografia/latest
   * Read endpoint consumed by the Next.js frontend.
   * Returns the most recent ingested snapshot.
   */
  getLatest = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const record = await this.service.getLatestPayload();
      res.status(200).json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  };
}
