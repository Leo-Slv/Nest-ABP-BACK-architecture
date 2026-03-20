import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const schema = z.object({
  page: z.coerce.number().min(1).default(1).describe('Página'),
  limit: z.coerce.number().min(1).max(100).default(20).describe('Itens por página'),
  search: z.string().optional().describe('Busca por nome, domínio ou indústria'),
});

export class ListCompaniesDto extends createZodDto(schema) {}
