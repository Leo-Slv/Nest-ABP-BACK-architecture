import { Pipeline } from '../entities/pipeline.entity.js';
import { Name } from '../../../../shared/domain/value-objects/name.vo.js';

export type CreatePipelineInput = {
  name: string;
  stages?: { name: string; order: number }[];
};

/**
 * Factory para criação do agregado `Pipeline`.
 * Centraliza criação de `Name` e preparo das stages.
 */
export class PipelineFactory {
  create(input: CreatePipelineInput): Pipeline {
    const nameVO = new Name(input.name);
    const stages = input.stages?.map((s, i) => ({
      name: s.name,
      order: s.order ?? i,
    })) ?? [];

    return Pipeline.createNew(nameVO.value, stages);
  }
}

