import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
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
import { CreateDealUseCase } from '../../application/use-cases/create-deal.usecase.js';
import { UpdateDealUseCase } from '../../application/use-cases/update-deal.usecase.js';
import { DeleteDealUseCase } from '../../application/use-cases/delete-deal.usecase.js';
import { FindDealUseCase } from '../../application/use-cases/find-deal.usecase.js';
import { ListDealsUseCase } from '../../application/use-cases/list-deals.usecase.js';
import { MoveDealStageUseCase } from '../../application/use-cases/move-deal-stage.usecase.js';
import { CreateDealDto } from '../../application/dtos/create-deal.dto.js';
import { UpdateDealDto } from '../../application/dtos/update-deal.dto.js';
import { MoveStageDto } from '../../application/dtos/move-stage.dto.js';
import { ListDealsDto } from '../../application/dtos/list-deals.dto.js';
import { DealStage } from '../../domain/enums/deal-stage.enum.js';

const idParamSchema = z.object({
  id: z.string().uuid().describe('UUID do deal'),
});

class DealIdParamDto extends createZodDto(idParamSchema) {}

@ApiTags('deals')
@ApiBearerAuth()
@Controller('deals')
export class DealController {
  constructor(
    private readonly createUseCase: CreateDealUseCase,
    private readonly updateUseCase: UpdateDealUseCase,
    private readonly deleteUseCase: DeleteDealUseCase,
    private readonly findUseCase: FindDealUseCase,
    private readonly listUseCase: ListDealsUseCase,
    private readonly moveStageUseCase: MoveDealStageUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar deal',
    description: 'Cria um novo deal no sistema',
  })
  @ApiResponse({ status: 201, description: 'Deal criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  async create(@Body() dto: CreateDealDto) {
    const deal = await this.createUseCase.execute(dto);
    return this.toResponse(deal);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar deals',
    description: 'Lista deals com paginação e filtros',
  })
  @ApiResponse({ status: 200, description: 'Lista de deals retornada com sucesso' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Página' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Itens por página' })
  @ApiQuery({ name: 'stage', enum: DealStage, required: false, description: 'Filtro por estágio' })
  @ApiQuery({ name: 'pipelineId', type: String, required: false, description: 'Filtro por pipeline' })
  async list(@Query() query: ListDealsDto) {
    const result = await this.listUseCase.execute(query);
    return {
      data: result.data.map((d) => this.toResponse(d)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar deal por ID',
    description: 'Retorna um deal pelo UUID',
  })
  @ApiResponse({ status: 200, description: 'Deal encontrado' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async find(@Param() params: DealIdParamDto) {
    const deal = await this.findUseCase.execute(params.id);
    return this.toResponse(deal);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar deal',
    description: 'Atualiza um deal existente',
  })
  @ApiResponse({ status: 200, description: 'Deal atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async update(@Param() params: DealIdParamDto, @Body() dto: UpdateDealDto) {
    const deal = await this.updateUseCase.execute(params.id, dto);
    return this.toResponse(deal);
  }

  @Patch(':id/stage')
  @ApiOperation({
    summary: 'Mover deal de estágio',
    description: 'Atualiza o estágio do deal no pipeline',
  })
  @ApiResponse({ status: 200, description: 'Deal movido com sucesso' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async moveStage(@Param() params: DealIdParamDto, @Body() dto: MoveStageDto) {
    const deal = await this.moveStageUseCase.execute(params.id, dto);
    return this.toResponse(deal);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir deal',
    description: 'Remove um deal do sistema',
  })
  @ApiResponse({ status: 204, description: 'Deal excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async delete(@Param() params: DealIdParamDto) {
    await this.deleteUseCase.execute(params.id);
  }

  private toResponse(deal: {
    id: string;
    title: string;
    value: number;
    stage: string;
    pipelineId: string | null;
    pipelineStageId: string | null;
    contactId: string | null;
    companyId: string | null;
    expectedAt: Date | null;
    closedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: deal.id,
      title: deal.title,
      value: deal.value,
      stage: deal.stage,
      pipelineId: deal.pipelineId,
      pipelineStageId: deal.pipelineStageId,
      contactId: deal.contactId,
      companyId: deal.companyId,
      expectedAt: deal.expectedAt,
      closedAt: deal.closedAt,
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt,
    };
  }
}
