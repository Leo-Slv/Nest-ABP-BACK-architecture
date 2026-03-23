import { randomUUID } from 'node:crypto';
import { AggregateRoot } from '../../../../shared/domain/aggregate-root.js';
import { DealStage } from '../enums/deal-stage.enum.js';
import { DealCreatedEvent } from '../events/deal-created.event.js';
import { DealUpdatedEvent } from '../events/deal-updated.event.js';
import { DealStageMovedEvent } from '../events/deal-stage-moved.event.js';

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

export class Deal extends AggregateRoot {
  private constructor(private props: DealEntity) {
    super();
  }

  static createNew(input: {
    title: string;
    value?: number;
    stage?: DealStage;
    pipelineId?: string | null;
    pipelineStageId?: string | null;
    contactId?: string | null;
    companyId?: string | null;
    expectedAt?: Date | null;
  }): Deal {
    const id = randomUUID();
    const now = new Date();
    const deal = new Deal({
      id,
      title: input.title,
      value: input.value ?? 0,
      stage: input.stage ?? DealStage.LEAD,
      pipelineId: input.pipelineId ?? null,
      pipelineStageId: input.pipelineStageId ?? null,
      contactId: input.contactId ?? null,
      companyId: input.companyId ?? null,
      expectedAt: input.expectedAt ?? null,
      closedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    deal.addDomainEvent(new DealCreatedEvent(id));
    return deal;
  }

  static reconstitute(props: DealEntity): Deal {
    return new Deal(props);
  }

  static create(props: DealEntity): Deal {
    return Deal.reconstitute(props);
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

  applyUpdate(input: {
    title?: string;
    value?: number;
    stage?: DealStage;
    pipelineId?: string | null;
    pipelineStageId?: string | null;
    contactId?: string | null;
    companyId?: string | null;
    expectedAt?: Date | null;
    closedAt?: Date | null;
  }): void {
    const p = this.props as Writable<DealEntity>;
    if (input.title !== undefined) p.title = input.title;
    if (input.value !== undefined) p.value = input.value;
    if (input.stage !== undefined) p.stage = input.stage;
    if (input.pipelineId !== undefined) p.pipelineId = input.pipelineId;
    if (input.pipelineStageId !== undefined) p.pipelineStageId = input.pipelineStageId;
    if (input.contactId !== undefined) p.contactId = input.contactId;
    if (input.companyId !== undefined) p.companyId = input.companyId;
    if (input.expectedAt !== undefined) p.expectedAt = input.expectedAt;
    if (input.closedAt !== undefined) p.closedAt = input.closedAt;
    p.updatedAt = new Date();
    this.addDomainEvent(new DealUpdatedEvent(this.id));
  }

  moveToStage(stage: DealStage, pipelineStageId?: string | null): void {
    const p = this.props as Writable<DealEntity>;
    p.stage = stage;
    if (pipelineStageId !== undefined) {
      p.pipelineStageId = pipelineStageId;
    }
    if (stage === DealStage.WON || stage === DealStage.LOST) {
      p.closedAt = new Date();
    }
    p.updatedAt = new Date();
    this.addDomainEvent(new DealStageMovedEvent(this.id, stage));
  }

  toPersistence(): DealEntity {
    return { ...this.props };
  }
}

type Writable<T> = { -readonly [P in keyof T]: T[P] };
