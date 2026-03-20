import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { DealStage } from '../../domain/enums/deal-stage.enum.js';

const schema = z.object({
  title: z.string().min(2).optional().describe('Título do deal'),
  value: z.coerce.number().min(0).optional().describe('Valor do deal'),
  stage: z.nativeEnum(DealStage).optional().describe('Estágio do deal'),
  pipelineId: z.string().uuid().optional().nullable().describe('ID do pipeline'),
  pipelineStageId: z.string().uuid().optional().nullable().describe('ID do estágio do pipeline'),
  contactId: z.string().uuid().optional().nullable().describe('ID do contato'),
  companyId: z.string().uuid().optional().nullable().describe('ID da empresa'),
  expectedAt: z.string().datetime().optional().nullable().describe('Data esperada de fechamento (ISO 8601)'),
  closedAt: z.string().datetime().optional().nullable().describe('Data de fechamento do deal (ISO 8601)'),
});

export class UpdateDealDto extends createZodDto(schema) {}
