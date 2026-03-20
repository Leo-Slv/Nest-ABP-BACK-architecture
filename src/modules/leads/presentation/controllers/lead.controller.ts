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
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CreateLeadUseCase } from '../../application/use-cases/create-lead.usecase.js';
import { UpdateLeadUseCase } from '../../application/use-cases/update-lead.usecase.js';
import { DeleteLeadUseCase } from '../../application/use-cases/delete-lead.usecase.js';
import { FindLeadUseCase } from '../../application/use-cases/find-lead.usecase.js';
import { ListLeadsUseCase } from '../../application/use-cases/list-leads.usecase.js';
import { ConvertLeadUseCase } from '../../application/use-cases/convert-lead.usecase.js';
import { CreateLeadDto } from '../../application/dtos/create-lead.dto.js';
import { UpdateLeadDto } from '../../application/dtos/update-lead.dto.js';
import { ListLeadsDto } from '../../application/dtos/list-leads.dto.js';
import { LeadStatus } from '../../domain/enums/lead-status.enum.js';

const idParamSchema = z.object({
  id: z.string().uuid().describe('UUID do lead'),
});

class LeadIdParamDto extends createZodDto(idParamSchema) {}

@ApiTags('leads')
@ApiBearerAuth()
@Controller('leads')
export class LeadController {
  constructor(
    private readonly createUseCase: CreateLeadUseCase,
    private readonly updateUseCase: UpdateLeadUseCase,
    private readonly deleteUseCase: DeleteLeadUseCase,
    private readonly findUseCase: FindLeadUseCase,
    private readonly listUseCase: ListLeadsUseCase,
    private readonly convertUseCase: ConvertLeadUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar lead',
    description: 'Cria um novo lead no sistema',
  })
  @ApiResponse({ status: 201, description: 'Lead criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Conflito - email já existe' })
  async create(@Body() dto: CreateLeadDto) {
    const lead = await this.createUseCase.execute(dto);
    return this.toResponse(lead);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar leads',
    description: 'Lista leads com paginação, busca e filtro por status',
  })
  @ApiResponse({ status: 200, description: 'Lista de leads retornada com sucesso' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Página' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Itens por página' })
  @ApiQuery({ name: 'search', type: String, required: false, description: 'Busca por nome ou email' })
  @ApiQuery({ name: 'status', enum: LeadStatus, required: false, description: 'Filtro por status' })
  async list(@Query() query: ListLeadsDto) {
    const result = await this.listUseCase.execute(query);
    return {
      data: result.data.map((l) => this.toResponse(l)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar lead por ID',
    description: 'Retorna um lead pelo UUID',
  })
  @ApiResponse({ status: 200, description: 'Lead encontrado' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async find(@Param() params: LeadIdParamDto) {
    const lead = await this.findUseCase.execute(params.id);
    return this.toResponse(lead);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar lead',
    description: 'Atualiza um lead existente',
  })
  @ApiResponse({ status: 200, description: 'Lead atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiResponse({ status: 409, description: 'Conflito - email já existe' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async update(@Param() params: LeadIdParamDto, @Body() dto: UpdateLeadDto) {
    const lead = await this.updateUseCase.execute(params.id, dto);
    return this.toResponse(lead);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir lead',
    description: 'Remove um lead do sistema',
  })
  @ApiResponse({ status: 204, description: 'Lead excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async delete(@Param() params: LeadIdParamDto) {
    await this.deleteUseCase.execute(params.id);
  }

  @Post(':id/convert')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Converter lead em contato',
    description: 'Converte o lead em contato, marcando como CONVERTED e vinculando ao novo contato',
  })
  @ApiResponse({ status: 200, description: 'Lead convertido com sucesso' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiResponse({ status: 409, description: 'Conflito - lead já convertido' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async convert(@Param() params: LeadIdParamDto) {
    const lead = await this.convertUseCase.execute(params.id);
    return this.toResponse(lead);
  }

  private toResponse(lead: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    source: string | null;
    status: string;
    notes: string | null;
    convertedAt: Date | null;
    contactId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      notes: lead.notes,
      convertedAt: lead.convertedAt,
      contactId: lead.contactId,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    };
  }
}
