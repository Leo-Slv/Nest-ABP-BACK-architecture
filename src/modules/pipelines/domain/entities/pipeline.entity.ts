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

export class Pipeline {
  private constructor(readonly props: PipelineEntity) {}

  static create(props: PipelineEntity): Pipeline {
    return new Pipeline(props);
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
}
