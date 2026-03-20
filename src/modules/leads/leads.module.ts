import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/database/prisma.module.js';
import { ContactsModule } from '../contacts/contacts.module.js';
import { LeadController } from './presentation/controllers/lead.controller.js';
import { LeadPrismaRepository } from './infrastructure/repositories/lead.prisma.repository.js';
import { CreateLeadUseCase } from './application/use-cases/create-lead.usecase.js';
import { UpdateLeadUseCase } from './application/use-cases/update-lead.usecase.js';
import { DeleteLeadUseCase } from './application/use-cases/delete-lead.usecase.js';
import { FindLeadUseCase } from './application/use-cases/find-lead.usecase.js';
import { ListLeadsUseCase } from './application/use-cases/list-leads.usecase.js';
import { ConvertLeadUseCase } from './application/use-cases/convert-lead.usecase.js';

@Module({
  imports: [PrismaModule, ContactsModule],
  controllers: [LeadController],
  providers: [
    {
      provide: 'ILeadRepository',
      useClass: LeadPrismaRepository,
    },
    CreateLeadUseCase,
    UpdateLeadUseCase,
    DeleteLeadUseCase,
    FindLeadUseCase,
    ListLeadsUseCase,
    ConvertLeadUseCase,
  ],
  exports: [],
})
export class LeadsModule {}
