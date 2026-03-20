import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { DealStage } from '../../domain/enums/deal-stage.enum.js';

const schema = z.object({
  stage: z.nativeEnum(DealStage).describe('Novo estágio do deal'),
  pipelineStageId: z.string().uuid().optional().nullable().describe('ID do estágio do pipeline de destino'),
});

export class MoveStageDto extends createZodDto(schema) {}
