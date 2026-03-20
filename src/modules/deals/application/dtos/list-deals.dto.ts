import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { DealStage } from '../../domain/enums/deal-stage.enum.js';

const schema = z.object({
  page: z.coerce.number().min(1).default(1).describe('Página'),
  limit: z.coerce.number().min(1).max(100).default(20).describe('Itens por página'),
  stage: z.nativeEnum(DealStage).optional().describe('Filtro por estágio'),
  pipelineId: z.string().uuid().optional().describe('Filtro por pipeline'),
});

export class ListDealsDto extends createZodDto(schema) {}
