import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2).describe('Nome da empresa'),
  domain: z.string().optional().describe('Domínio único (ex: empresa.com)'),
  industry: z.string().optional().describe('Setor de atuação'),
  website: z.string().url().optional().describe('Site da empresa'),
});

export class CreateCompanyDto extends createZodDto(schema) {}
