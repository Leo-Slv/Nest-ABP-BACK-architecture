import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/database/prisma.module.js';
import { DomainEventsModule } from './shared/domain-events.module.js';
import { LeadsModule } from './modules/leads/leads.module.js';
import { ContactsModule } from './modules/contacts/contacts.module.js';
import { CompaniesModule } from './modules/companies/companies.module.js';
import { DealsModule } from './modules/deals/deals.module.js';
import { PipelinesModule } from './modules/pipelines/pipelines.module.js';
import { TasksModule } from './modules/tasks/tasks.module.js';

@Module({
  imports: [
    PrismaModule,
    DomainEventsModule,
    LeadsModule,
    ContactsModule,
    CompaniesModule,
    DealsModule,
    PipelinesModule,
    TasksModule,
  ],
})
export class AppModule {}
