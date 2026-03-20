import { LeadStatus } from '../enums/lead-status.enum.js';

export interface LeadEntity {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string | null;
  readonly source: string | null;
  readonly status: LeadStatus;
  readonly notes: string | null;
  readonly convertedAt: Date | null;
  readonly contactId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Lead {
  private constructor(readonly props: LeadEntity) {}

  static create(props: LeadEntity): Lead {
    return new Lead(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get phone(): string | null {
    return this.props.phone;
  }

  get source(): string | null {
    return this.props.source;
  }

  get status(): LeadStatus {
    return this.props.status;
  }

  get notes(): string | null {
    return this.props.notes;
  }

  get convertedAt(): Date | null {
    return this.props.convertedAt;
  }

  get contactId(): string | null {
    return this.props.contactId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
