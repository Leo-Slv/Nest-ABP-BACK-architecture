import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { LeadStatus } from '../../domain/enums/lead-status.enum.js';

const schema = z.object({
  name: z.string().min(2).optional().describe('Nome completo do lead'),
  email: z.string().email().optional().describe('Email de contato'),
  phone: z.string().optional().nullable().describe('Telefone'),
  source: z.string().optional().nullable().describe('Fonte do lead'),
  status: z.nativeEnum(LeadStatus).optional().describe('Status do lead'),
  notes: z.string().optional().nullable().describe('Observações'),
});

export class UpdateLeadDto extends createZodDto(schema) {}
