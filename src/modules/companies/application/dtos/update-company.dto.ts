import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2).optional().describe('Nome da empresa'),
  domain: z.string().optional().nullable().describe('Domínio único'),
  industry: z.string().optional().nullable().describe('Setor de atuação'),
  website: z.string().url().optional().nullable().describe('Site da empresa'),
});

export class UpdateCompanyDto extends createZodDto(schema) {}
