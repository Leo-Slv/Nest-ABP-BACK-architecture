import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CreateCompanyUseCase } from '../../application/use-cases/create-company.usecase.js';
import { UpdateCompanyUseCase } from '../../application/use-cases/update-company.usecase.js';
import { DeleteCompanyUseCase } from '../../application/use-cases/delete-company.usecase.js';
import { FindCompanyUseCase } from '../../application/use-cases/find-company.usecase.js';
import { ListCompaniesUseCase } from '../../application/use-cases/list-companies.usecase.js';
import { CreateCompanyDto } from '../../application/dtos/create-company.dto.js';
import { UpdateCompanyDto } from '../../application/dtos/update-company.dto.js';
import { ListCompaniesDto } from '../../application/dtos/list-companies.dto.js';

const idParamSchema = z.object({
  id: z.string().uuid().describe('UUID da empresa'),
});

class CompanyIdParamDto extends createZodDto(idParamSchema) {}

@ApiTags('companies')
@ApiBearerAuth()
@Controller('companies')
export class CompanyController {
  constructor(
    private readonly createUseCase: CreateCompanyUseCase,
    private readonly updateUseCase: UpdateCompanyUseCase,
    private readonly deleteUseCase: DeleteCompanyUseCase,
    private readonly findUseCase: FindCompanyUseCase,
    private readonly listUseCase: ListCompaniesUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar empresa',
    description: 'Cria uma nova empresa no sistema',
  })
  @ApiResponse({ status: 201, description: 'Empresa criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Conflito - domínio já existe' })
  async create(@Body() dto: CreateCompanyDto) {
    const company = await this.createUseCase.execute(dto);
    return {
      id: company.id,
      name: company.name,
      domain: company.domain,
      industry: company.industry,
      website: company.website,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Listar empresas',
    description: 'Lista empresas com paginação e busca',
  })
  @ApiResponse({ status: 200, description: 'Lista de empresas retornada com sucesso' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Página' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Itens por página' })
  @ApiQuery({ name: 'search', type: String, required: false, description: 'Busca por nome ou domínio' })
  async list(@Query() query: ListCompaniesDto) {
    const result = await this.listUseCase.execute(query);
    return {
      data: result.data.map((c) => ({
        id: c.id,
        name: c.name,
        domain: c.domain,
        industry: c.industry,
        website: c.website,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar empresa por ID',
    description: 'Retorna uma empresa pelo UUID',
  })
  @ApiResponse({ status: 200, description: 'Empresa encontrada' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async find(@Param() params: CompanyIdParamDto) {
    const company = await this.findUseCase.execute(params.id);
    return {
      id: company.id,
      name: company.name,
      domain: company.domain,
      industry: company.industry,
      website: company.website,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar empresa',
    description: 'Atualiza uma empresa existente',
  })
  @ApiResponse({ status: 200, description: 'Empresa atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiResponse({ status: 409, description: 'Conflito - domínio já existe' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async update(@Param() params: CompanyIdParamDto, @Body() dto: UpdateCompanyDto) {
    const company = await this.updateUseCase.execute(params.id, dto);
    return {
      id: company.id,
      name: company.name,
      domain: company.domain,
      industry: company.industry,
      website: company.website,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir empresa',
    description: 'Remove uma empresa do sistema',
  })
  @ApiResponse({ status: 204, description: 'Empresa excluída com sucesso' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async delete(@Param() params: CompanyIdParamDto) {
    await this.deleteUseCase.execute(params.id);
  }
}
