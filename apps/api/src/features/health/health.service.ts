import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface HealthStatus {
  status: 'ok';
  timestamp: string;
  uptime: number;
  database: 'ok';
}

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthStatus> {
    try {
      // Trivial round-trip query to confirm the DB connection is alive,
      // not just that Prisma was able to instantiate a client.
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'unknown error';
      throw new ServiceUnavailableException(`Database check failed: ${reason}`);
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'ok',
    };
  }
}
