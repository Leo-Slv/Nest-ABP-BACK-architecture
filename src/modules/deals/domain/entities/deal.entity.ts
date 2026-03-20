import { DealStage } from '../enums/deal-stage.enum.js';

export interface DealEntity {
  readonly id: string;
  readonly title: string;
  readonly value: number;
  readonly stage: DealStage;
  readonly pipelineId: string | null;
  readonly pipelineStageId: string | null;
  readonly contactId: string | null;
  readonly companyId: string | null;
  readonly expectedAt: Date | null;
  readonly closedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Deal {
  private constructor(readonly props: DealEntity) {}

  static create(props: DealEntity): Deal {
    return new Deal(props);
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get value(): number {
    return this.props.value;
  }

  get stage(): DealStage {
    return this.props.stage;
  }

  get pipelineId(): string | null {
    return this.props.pipelineId;
  }

  get pipelineStageId(): string | null {
    return this.props.pipelineStageId;
  }

  get contactId(): string | null {
    return this.props.contactId;
  }

  get companyId(): string | null {
    return this.props.companyId;
  }

  get expectedAt(): Date | null {
    return this.props.expectedAt;
  }

  get closedAt(): Date | null {
    return this.props.closedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
