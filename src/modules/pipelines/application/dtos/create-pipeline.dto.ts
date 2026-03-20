import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createPipelineSchema = z.object({
  name: z.string().min(2).describe('Nome do pipeline'),
  stages: z
    .array(
      z.object({
        name: z.string().min(2).describe('Nome do estágio'),
        order: z.coerce.number().int().min(0).describe('Ordem do estágio'),
      }),
    )
    .optional()
    .describe('Estágios do pipeline'),
});

export class CreatePipelineDto extends createZodDto(createPipelineSchema) {}
