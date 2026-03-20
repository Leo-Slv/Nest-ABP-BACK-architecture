import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2).optional().describe('Nome completo do contato'),
  email: z.string().email().optional().describe('Email de contato'),
  phone: z.string().optional().describe('Telefone'),
  role: z.string().optional().describe('Cargo/função'),
  companyId: z.string().uuid().nullable().optional().describe('ID da empresa vinculada'),
});

export class UpdateContactDto extends createZodDto(schema) {}
