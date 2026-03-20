import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/database/prisma.module.js';
import { CompanyController } from './presentation/controllers/company.controller.js';
import { CompanyPrismaRepository } from './infrastructure/repositories/company.prisma.repository.js';
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
    CreateCompanyUseCase,
    UpdateCompanyUseCase,
    DeleteCompanyUseCase,
    FindCompanyUseCase,
    ListCompaniesUseCase,
  ],
  exports: [CreateCompanyUseCase, FindCompanyUseCase],
})
export class CompaniesModule {}
