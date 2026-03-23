import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/database/prisma.module.js';
import { CompanyController } from './presentation/controllers/company.controller.js';
import { CompanyPrismaRepository } from './infrastructure/repositories/company.prisma.repository.js';
import { CompanyDomainUniqueSpec } from './domain/specifications/company-domain-unique.specification.js';
import { CompanyCreatedEventHandler } from './application/handlers/company-created.handler.js';
import { CompanyUpdatedEventHandler } from './application/handlers/company-updated.handler.js';
import { CompanyDeletedEventHandler } from './application/handlers/company-deleted.handler.js';
import { CompanyFactory } from './domain/factories/company.factory.js';
import { CreateCompanyUseCase } from './application/use-cases/create-company.usecase.js';
import { UpdateCompanyUseCase } from './application/use-cases/update-company.usecase.js';
import { DeleteCompanyUseCase } from './application/use-cases/delete-company.usecase.js';
import { FindCompanyUseCase } from './application/use-cases/find-company.usecase.js';
import { ListCompaniesUseCase } from './application/use-cases/list-companies.usecase.js';

@Module({
  imports: [PrismaModule],
  controllers: [CompanyController],
  providers: [
    {
      provide: 'ICompanyRepository',
      useClass: CompanyPrismaRepository,
    },
    CompanyDomainUniqueSpec,
    CompanyCreatedEventHandler,
    CompanyUpdatedEventHandler,
    CompanyDeletedEventHandler,
    CompanyFactory,
    CreateCompanyUseCase,
    UpdateCompanyUseCase,
    DeleteCompanyUseCase,
    FindCompanyUseCase,
    ListCompaniesUseCase,
  ],
  exports: [CreateCompanyUseCase, FindCompanyUseCase],
})
export class CompaniesModule {}
