import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TaskType } from '../../domain/enums/task-type.enum.js';

const schema = z.object({
  page: z.coerce.number().min(1).default(1).describe('Página'),
  limit: z.coerce.number().min(1).max(100).default(20).describe('Itens por página'),
  type: z.nativeEnum(TaskType).optional().describe('Filtro por tipo'),
  dealId: z.string().uuid().optional().describe('Filtro por deal'),
  contactId: z.string().uuid().optional().describe('Filtro por contato'),
});

export class ListTasksDto extends createZodDto(schema) {}
