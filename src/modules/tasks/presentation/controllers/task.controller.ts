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
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CreateTaskUseCase } from '../../application/use-cases/create-task.usecase.js';
import { UpdateTaskUseCase } from '../../application/use-cases/update-task.usecase.js';
import { DeleteTaskUseCase } from '../../application/use-cases/delete-task.usecase.js';
import { FindTaskUseCase } from '../../application/use-cases/find-task.usecase.js';
import { ListTasksUseCase } from '../../application/use-cases/list-tasks.usecase.js';
import { CompleteTaskUseCase } from '../../application/use-cases/complete-task.usecase.js';
import { CreateTaskDto } from '../../application/dtos/create-task.dto.js';
import { UpdateTaskDto } from '../../application/dtos/update-task.dto.js';
import { ListTasksDto } from '../../application/dtos/list-tasks.dto.js';
import { TaskType } from '../../domain/enums/task-type.enum.js';

const idParamSchema = z.object({
  id: z.string().uuid().describe('UUID da tarefa'),
});

class TaskIdParamDto extends createZodDto(idParamSchema) {}

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TaskController {
  constructor(
    private readonly createUseCase: CreateTaskUseCase,
    private readonly updateUseCase: UpdateTaskUseCase,
    private readonly deleteUseCase: DeleteTaskUseCase,
    private readonly findUseCase: FindTaskUseCase,
    private readonly listUseCase: ListTasksUseCase,
    private readonly completeUseCase: CompleteTaskUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar tarefa',
    description: 'Cria uma nova tarefa no sistema',
  })
  @ApiResponse({ status: 201, description: 'Tarefa criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() dto: CreateTaskDto) {
    const task = await this.createUseCase.execute(dto);
    return this.toResponse(task);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar tarefas',
    description: 'Lista tarefas com paginação e filtros',
  })
  @ApiResponse({ status: 200, description: 'Lista de tarefas retornada com sucesso' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Página' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Itens por página' })
  @ApiQuery({ name: 'type', enum: TaskType, required: false, description: 'Filtro por tipo' })
  @ApiQuery({ name: 'dealId', type: String, required: false, description: 'Filtro por deal' })
  @ApiQuery({ name: 'contactId', type: String, required: false, description: 'Filtro por contato' })
  async list(@Query() query: ListTasksDto) {
    const result = await this.listUseCase.execute(query);
    return {
      data: result.data.map((t) => this.toResponse(t)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar tarefa por ID',
    description: 'Retorna uma tarefa pelo UUID',
  })
  @ApiResponse({ status: 200, description: 'Tarefa encontrada' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async find(@Param() params: TaskIdParamDto) {
    const task = await this.findUseCase.execute(params.id);
    return this.toResponse(task);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar tarefa',
    description: 'Atualiza uma tarefa existente',
  })
  @ApiResponse({ status: 200, description: 'Tarefa atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async update(@Param() params: TaskIdParamDto, @Body() dto: UpdateTaskDto) {
    const task = await this.updateUseCase.execute(params.id, dto);
    return this.toResponse(task);
  }

  @Patch(':id/complete')
  @ApiOperation({
    summary: 'Concluir tarefa',
    description: 'Marca a tarefa como concluída',
  })
  @ApiResponse({ status: 200, description: 'Tarefa concluída com sucesso' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async complete(@Param() params: TaskIdParamDto) {
    const task = await this.completeUseCase.execute(params.id);
    return this.toResponse(task);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir tarefa',
    description: 'Remove uma tarefa do sistema',
  })
  @ApiResponse({ status: 204, description: 'Tarefa excluída com sucesso' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async delete(@Param() params: TaskIdParamDto) {
    await this.deleteUseCase.execute(params.id);
  }

  private toResponse(task: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    dueAt: Date | null;
    completedAt: Date | null;
    leadId: string | null;
    contactId: string | null;
    companyId: string | null;
    dealId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      type: task.type,
      dueAt: task.dueAt,
      completedAt: task.completedAt,
      leadId: task.leadId,
      contactId: task.contactId,
      companyId: task.companyId,
      dealId: task.dealId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
