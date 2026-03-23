import { randomUUID } from 'node:crypto';
import { AggregateRoot } from '../../../../shared/domain/aggregate-root.js';
import { PipelineCreatedEvent } from '../events/pipeline-created.event.js';
import { PipelineUpdatedEvent } from '../events/pipeline-updated.event.js';

export interface PipelineStageEntity {
  readonly id: string;
  readonly name: string;
  readonly order: number;
  readonly pipelineId: string;
}

export interface PipelineEntity {
  readonly id: string;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly stages?: PipelineStageEntity[];
}

export class PipelineStage {
  private constructor(readonly props: PipelineStageEntity) {}

  static create(props: PipelineStageEntity): PipelineStage {
    return new PipelineStage(props);
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get order(): number {
    return this.props.order;
  }
  get pipelineId(): string {
    return this.props.pipelineId;
  }
}

export class Pipeline extends AggregateRoot {
  private constructor(
    private props: PipelineEntity,
    private readonly pendingStages: { name: string; order: number }[] | null,
  ) {
    super();
  }

  static createNew(
    name: string,
    stages: { name: string; order: number }[],
  ): Pipeline {
    const id = randomUUID();
    const now = new Date();
    const pipeline = new Pipeline(
      {
        id,
        name,
        createdAt: now,
        updatedAt: now,
      },
      stages,
    );
    pipeline.addDomainEvent(new PipelineCreatedEvent(id));
    return pipeline;
  }

  static reconstitute(props: PipelineEntity): Pipeline {
    return new Pipeline(props, null);
  }

  static create(props: PipelineEntity): Pipeline {
    return Pipeline.reconstitute(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get stages(): PipelineStage[] | undefined {
    return this.props.stages?.map((s) => PipelineStage.create(s));
  }

  getPendingStagesForCreate(): { name: string; order: number }[] {
    return this.pendingStages ?? [];
  }

  changeName(name: string): void {
    const p = this.props as Writable<PipelineEntity>;
    p.name = name;
    p.updatedAt = new Date();
    this.addDomainEvent(new PipelineUpdatedEvent(this.id));
  }

  toPersistence(): PipelineEntity {
    return { ...this.props };
  }
}

type Writable<T> = { -readonly [P in keyof T]: T[P] };
