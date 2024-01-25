import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoggerService } from '@backend/logger';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private loggerService: LoggerService) {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });
  }
  async onModuleInit() {
    const start = Date.now();
    await this['$connect']().then(() => {
      const end = Date.now();
      this.loggerService.log('debug', 'Prisma connected to the DB', {
        timeToConnect: end - start,
      });
    });
    this['$on']('query' as any, (queryEvent: any) => {
      const { query, duration, target } = queryEvent;
      this.loggerService.log('debug', 'query', {
        query,
        duration,
        target,
      });
    });
    this['$on']('error' as any, (queryEvent: any) => {
      const { message, target, params } = queryEvent;
      this.loggerService.log('debug', 'query error', {
        errorMessage: message,
        target,
        params,
      });
    });
  }
  async onModuleDestroy(): Promise<void> {
    await this['$disconnect']().then(() => {
      this.loggerService.log('debug', 'Prisma disconnected from the DB');
    });
  }
}
