import { PrismaClient, Prisma } from '@prisma/client';
import {
  IDemografiaRepository,
  DemografiaData,
  N8nPayload,
} from '../interfaces/demografia.interface';

export class DemografiaRepository implements IDemografiaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(payload: N8nPayload): Promise<DemografiaData> {
    const record = await this.prisma.demografiaData.create({
      data: {
        // Prisma requires InputJsonValue; the validated DTO is a plain object,
        // so this cast is safe — Zod already guaranteed the shape.
        payload: payload as unknown as Prisma.InputJsonValue,
      },
    });

    return this.toEntity(record);
  }

  async findLatest(): Promise<DemografiaData | null> {
    const record = await this.prisma.demografiaData.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    return record ? this.toEntity(record) : null;
  }

  // Maps a raw Prisma row to the typed domain entity.
  // The payload stored in MariaDB is returned as a plain object — we cast it
  // back to the known shape since the DTO validated it at write time.
  private toEntity(record: {
    id: string;
    payload: Prisma.JsonValue;
    createdAt: Date;
  }): DemografiaData {
    return {
      id: record.id,
      payload: record.payload as unknown as N8nPayload,
      createdAt: record.createdAt,
    };
  }
}
