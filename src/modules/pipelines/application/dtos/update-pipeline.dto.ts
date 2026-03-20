import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updatePipelineSchema = z.object({
  name: z.string().min(2).optional().describe('Nome do pipeline'),
});

export class UpdatePipelineDto extends createZodDto(updatePipelineSchema) {}
