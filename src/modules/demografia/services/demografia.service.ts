import { AppError } from '../../../common/filters/global-exception.filter';
import {
  IDemografiaRepository,
  IDemografiaService,
  DemografiaData,
  N8nPayload,
} from '../interfaces/demografia.interface';

export class DemografiaService implements IDemografiaService {
  constructor(private readonly repository: IDemografiaRepository) {}

  async savePayload(dto: N8nPayload): Promise<DemografiaData> {
    return this.repository.save(dto);
  }

  async getLatestPayload(): Promise<DemografiaData> {
    const record = await this.repository.findLatest();

    if (!record) {
      const err = new Error('No demographic data available yet') as AppError;
      err.statusCode = 404;
      throw err;
    }

    return record;
  }
}
