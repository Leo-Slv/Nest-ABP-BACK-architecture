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
import { CreatePipelineUseCase } from '../../application/use-cases/create-pipeline.usecase.js';
import { UpdatePipelineUseCase } from '../../application/use-cases/update-pipeline.usecase.js';
import { DeletePipelineUseCase } from '../../application/use-cases/delete-pipeline.usecase.js';
import { FindPipelineUseCase } from '../../application/use-cases/find-pipeline.usecase.js';
import { ListPipelinesUseCase } from '../../application/use-cases/list-pipelines.usecase.js';
import { CreatePipelineDto } from '../../application/dtos/create-pipeline.dto.js';
import { UpdatePipelineDto } from '../../application/dtos/update-pipeline.dto.js';

const idParamSchema = z.object({
  id: z.string().uuid().describe('UUID do pipeline'),
});

class PipelineIdParamDto extends createZodDto(idParamSchema) {}

@ApiTags('pipelines')
@ApiBearerAuth()
@Controller('pipelines')
export class PipelineController {
  constructor(
    private readonly createUseCase: CreatePipelineUseCase,
    private readonly updateUseCase: UpdatePipelineUseCase,
    private readonly deleteUseCase: DeletePipelineUseCase,
    private readonly findUseCase: FindPipelineUseCase,
    private readonly listUseCase: ListPipelinesUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar pipeline',
    description: 'Cria um novo pipeline com estágios',
  })
  @ApiResponse({ status: 201, description: 'Pipeline criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() dto: CreatePipelineDto) {
    const pipeline = await this.createUseCase.execute(dto);
    return {
      id: pipeline.id,
      name: pipeline.name,
      createdAt: pipeline.createdAt,
      updatedAt: pipeline.updatedAt,
      stages: pipeline.stages?.map((s) => ({
        id: s.id,
        name: s.name,
        order: s.order,
        pipelineId: s.pipelineId,
      })),
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Listar pipelines',
    description: 'Lista todos os pipelines com paginação',
  })
  @ApiResponse({ status: 200, description: 'Lista de pipelines retornada com sucesso' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async list(@Query() query: { page?: number; limit?: number }) {
    const result = await this.listUseCase.execute({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
    return {
      data: result.data.map((p) => ({
        id: p.id,
        name: p.name,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        stages: p.stages?.map((s) => ({
          id: s.id,
          name: s.name,
          order: s.order,
          pipelineId: s.pipelineId,
        })),
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar pipeline por ID',
    description: 'Retorna um pipeline pelo UUID',
  })
  @ApiResponse({ status: 200, description: 'Pipeline encontrado' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async find(@Param() params: PipelineIdParamDto) {
    const pipeline = await this.findUseCase.execute(params.id);
    return {
      id: pipeline.id,
      name: pipeline.name,
      createdAt: pipeline.createdAt,
      updatedAt: pipeline.updatedAt,
      stages: pipeline.stages?.map((s) => ({
        id: s.id,
        name: s.name,
        order: s.order,
        pipelineId: s.pipelineId,
      })),
    };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar pipeline',
    description: 'Atualiza um pipeline existente',
  })
  @ApiResponse({ status: 200, description: 'Pipeline atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async update(@Param() params: PipelineIdParamDto, @Body() dto: UpdatePipelineDto) {
    const pipeline = await this.updateUseCase.execute(params.id, dto);
    return {
      id: pipeline.id,
      name: pipeline.name,
      createdAt: pipeline.createdAt,
      updatedAt: pipeline.updatedAt,
      stages: pipeline.stages?.map((s) => ({
        id: s.id,
        name: s.name,
        order: s.order,
        pipelineId: s.pipelineId,
      })),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir pipeline',
    description: 'Remove um pipeline do sistema',
  })
  @ApiResponse({ status: 204, description: 'Pipeline excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async delete(@Param() params: PipelineIdParamDto) {
    await this.deleteUseCase.execute(params.id);
  }
}
