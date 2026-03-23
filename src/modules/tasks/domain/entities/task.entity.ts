import { randomUUID } from 'node:crypto';
import { AggregateRoot } from '../../../../shared/domain/aggregate-root.js';
import { TaskType } from '../enums/task-type.enum.js';
import { TaskCreatedEvent } from '../events/task-created.event.js';
import { TaskUpdatedEvent } from '../events/task-updated.event.js';
import { TaskCompletedEvent } from '../events/task-completed.event.js';
import { TaskDeletedEvent } from '../events/task-deleted.event.js';

export interface TaskEntity {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly type: TaskType;
  readonly dueAt: Date | null;
  readonly completedAt: Date | null;
  readonly leadId: string | null;
  readonly contactId: string | null;
  readonly companyId: string | null;
  readonly dealId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Task extends AggregateRoot {
  private constructor(private props: TaskEntity) {
    super();
  }

  static createNew(input: {
    title: string;
    description?: string | null;
    type?: TaskType;
    dueAt?: Date | null;
    leadId?: string | null;
    contactId?: string | null;
    companyId?: string | null;
    dealId?: string | null;
  }): Task {
    const id = randomUUID();
    const now = new Date();
    const task = new Task({
      id,
      title: input.title,
      description: input.description ?? null,
      type: input.type ?? TaskType.CALL,
      dueAt: input.dueAt ?? null,
      completedAt: null,
      leadId: input.leadId ?? null,
      contactId: input.contactId ?? null,
      companyId: input.companyId ?? null,
      dealId: input.dealId ?? null,
      createdAt: now,
      updatedAt: now,
    });
    task.addDomainEvent(new TaskCreatedEvent(id));
    return task;
  }

  static reconstitute(props: TaskEntity): Task {
    return new Task(props);
  }

  static create(props: TaskEntity): Task {
    return Task.reconstitute(props);
  }

  get id(): string {
    return this.props.id;
  }
  get title(): string {
    return this.props.title;
  }
  get description(): string | null {
    return this.props.description;
  }
  get type(): TaskType {
    return this.props.type;
  }
  get dueAt(): Date | null {
    return this.props.dueAt;
  }
  get completedAt(): Date | null {
    return this.props.completedAt;
  }
  get leadId(): string | null {
    return this.props.leadId;
  }
  get contactId(): string | null {
    return this.props.contactId;
  }
  get companyId(): string | null {
    return this.props.companyId;
  }
  get dealId(): string | null {
    return this.props.dealId;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  applyUpdate(input: {
    title?: string;
    description?: string | null;
    type?: TaskType;
    dueAt?: Date | null;
    leadId?: string | null;
    contactId?: string | null;
    companyId?: string | null;
    dealId?: string | null;
  }): void {
    const p = this.props as Writable<TaskEntity>;
    if (input.title !== undefined) p.title = input.title;
    if (input.description !== undefined) p.description = input.description;
    if (input.type !== undefined) p.type = input.type;
    if (input.dueAt !== undefined) p.dueAt = input.dueAt;
    if (input.leadId !== undefined) p.leadId = input.leadId;
    if (input.contactId !== undefined) p.contactId = input.contactId;
    if (input.companyId !== undefined) p.companyId = input.companyId;
    if (input.dealId !== undefined) p.dealId = input.dealId;
    p.updatedAt = new Date();
    this.addDomainEvent(new TaskUpdatedEvent(this.id));
  }

  markComplete(): void {
    if (this.props.completedAt) {
      return;
    }
    const p = this.props as Writable<TaskEntity>;
    p.completedAt = new Date();
    p.updatedAt = new Date();
    this.addDomainEvent(new TaskCompletedEvent(this.id));
  }

  markDeleted(): void {
    this.addDomainEvent(new TaskDeletedEvent(this.id));
  }

  toPersistence(): TaskEntity {
    return { ...this.props };
  }
}

type Writable<T> = { -readonly [P in keyof T]: T[P] };
