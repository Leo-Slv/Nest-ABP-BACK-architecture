import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TaskType } from '../../domain/enums/task-type.enum.js';

const schema = z.object({
  title: z.string().min(1).describe('Título da tarefa'),
  description: z.string().optional().describe('Descrição'),
  type: z.nativeEnum(TaskType).optional().describe('Tipo da tarefa'),
  dueAt: z.string().datetime().optional().describe('Data de vencimento (ISO 8601)'),
  leadId: z.string().uuid().optional().describe('UUID do lead'),
  contactId: z.string().uuid().optional().describe('UUID do contato'),
  companyId: z.string().uuid().optional().describe('UUID da empresa'),
  dealId: z.string().uuid().optional().describe('UUID do deal'),
});

export class CreateTaskDto extends createZodDto(schema) {}
