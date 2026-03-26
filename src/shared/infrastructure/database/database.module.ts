import { Global, Module } from '@nestjs/common';
import { UnitOfWork } from './unit-of-work.js';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: 'IUnitOfWork',
      useClass: UnitOfWork,
    },
  ],
  exports: [PrismaService, 'IUnitOfWork'],
})
export class DatabaseModule {}
