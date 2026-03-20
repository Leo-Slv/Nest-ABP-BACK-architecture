import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { LeadStatus } from '../../domain/enums/lead-status.enum.js';

const schema = z.object({
  page: z.coerce.number().min(1).default(1).describe('Página'),
  limit: z.coerce.number().min(1).max(100).default(20).describe('Itens por página'),
  search: z.string().optional().describe('Busca por nome ou email'),
  status: z.nativeEnum(LeadStatus).optional().describe('Filtrar por status'),
});

export class ListLeadsDto extends createZodDto(schema) {}
