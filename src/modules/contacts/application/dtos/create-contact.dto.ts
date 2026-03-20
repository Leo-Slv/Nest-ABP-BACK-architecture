import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2).describe('Nome completo do contato'),
  email: z.string().email().describe('Email de contato'),
  phone: z.string().optional().describe('Telefone'),
  role: z.string().optional().describe('Cargo/função'),
  companyId: z.string().uuid().optional().describe('ID da empresa vinculada'),
});

export class CreateContactDto extends createZodDto(schema) {}
