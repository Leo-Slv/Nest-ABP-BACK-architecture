import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import { env } from '../../../config/env.js';
import { DATABASE_POOL } from './database.tokens.js';
import { UnitOfWork } from './unit-of-work.js';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      useFactory: (): Pool =>
        new Pool({ connectionString: env.DATABASE_URL }),
    },
    {
      provide: 'IUnitOfWork',
      useClass: UnitOfWork,
    },
  ],
  exports: [DATABASE_POOL, 'IUnitOfWork'],
})
export class DatabaseModule {}
