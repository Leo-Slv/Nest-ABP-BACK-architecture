import { TaskType } from '../enums/task-type.enum.js';

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

export class Task {
  private constructor(readonly props: TaskEntity) {}

  static create(props: TaskEntity): Task {
    return new Task(props);
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
}
