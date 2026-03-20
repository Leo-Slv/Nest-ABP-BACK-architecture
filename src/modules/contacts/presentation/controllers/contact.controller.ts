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
  Inject,
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
import { CreateContactUseCase } from '../../application/use-cases/create-contact.usecase.js';
import { UpdateContactUseCase } from '../../application/use-cases/update-contact.usecase.js';
import { DeleteContactUseCase } from '../../application/use-cases/delete-contact.usecase.js';
import { FindContactUseCase } from '../../application/use-cases/find-contact.usecase.js';
import { ListContactsUseCase } from '../../application/use-cases/list-contacts.usecase.js';
import { CreateContactDto } from '../../application/dtos/create-contact.dto.js';
import { UpdateContactDto } from '../../application/dtos/update-contact.dto.js';
import { ListContactsDto } from '../../application/dtos/list-contacts.dto.js';

const idParamSchema = z.object({
  id: z.string().uuid().describe('UUID do contato'),
});

class ContactIdParamDto extends createZodDto(idParamSchema) {}

@ApiTags('contacts')
@ApiBearerAuth()
@Controller('contacts')
export class ContactController {
  constructor(
    private readonly createUseCase: CreateContactUseCase,
    private readonly updateUseCase: UpdateContactUseCase,
    private readonly deleteUseCase: DeleteContactUseCase,
    private readonly findUseCase: FindContactUseCase,
    private readonly listUseCase: ListContactsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar contato',
    description: 'Cria um novo contato no sistema',
  })
  @ApiResponse({ status: 201, description: 'Contato criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Conflito - email já existe' })
  async create(@Body() dto: CreateContactDto) {
    const contact = await this.createUseCase.execute(dto);
    return {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      role: contact.role,
      companyId: contact.companyId,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Listar contatos',
    description: 'Lista contatos com paginação e busca',
  })
  @ApiResponse({ status: 200, description: 'Lista de contatos retornada com sucesso' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Página' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Itens por página' })
  @ApiQuery({ name: 'search', type: String, required: false, description: 'Busca por nome ou email' })
  async list(@Query() query: ListContactsDto) {
    const result = await this.listUseCase.execute(query);
    return {
      data: result.data.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        role: c.role,
        companyId: c.companyId,
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
    summary: 'Buscar contato por ID',
    description: 'Retorna um contato pelo UUID',
  })
  @ApiResponse({ status: 200, description: 'Contato encontrado' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async find(@Param() params: ContactIdParamDto) {
    const contact = await this.findUseCase.execute(params.id);
    return {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      role: contact.role,
      companyId: contact.companyId,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar contato',
    description: 'Atualiza um contato existente',
  })
  @ApiResponse({ status: 200, description: 'Contato atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiResponse({ status: 409, description: 'Conflito - email já existe' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async update(@Param() params: ContactIdParamDto, @Body() dto: UpdateContactDto) {
    const contact = await this.updateUseCase.execute(params.id, dto);
    return {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      role: contact.role,
      companyId: contact.companyId,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir contato',
    description: 'Remove um contato do sistema',
  })
  @ApiResponse({ status: 204, description: 'Contato excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiParam({ name: 'id', description: 'UUID', format: 'uuid' })
  async delete(@Param() params: ContactIdParamDto) {
    await this.deleteUseCase.execute(params.id);
  }
}
