import { randomUUID } from 'node:crypto';
import { AggregateRoot } from '../../../../shared/domain/aggregate-root.js';
import type { Name } from '../../../../shared/domain/value-objects/name.vo.js';
import type { Email } from '../../../../shared/domain/value-objects/email.vo.js';
import type { Phone } from '../../../../shared/domain/value-objects/phone.vo.js';
import { LeadStatus } from '../enums/lead-status.enum.js';
import type { LeadSource } from '../value-objects/lead-source.vo.js';
import { LeadCreatedEvent } from '../events/lead-created.event.js';
import { LeadUpdatedEvent } from '../events/lead-updated.event.js';

export interface LeadProps {
  id: string;
  name: Name;
  email: Email;
  phone: Phone | null;
  source: LeadSource | null;
  status: LeadStatus;
  notes: string | null;
  convertedAt: Date | null;
  contactId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Lead Aggregate Root.
 * All modifications to Lead must go through this aggregate.
 * Other aggregates are referenced only by ID (e.g., contactId).
 */
export class Lead extends AggregateRoot {
  private constructor(private readonly props: LeadProps) {
    super();
  }

  static create(props: {
    name: Name;
    email: Email;
    phone?: Phone | null;
    source?: LeadSource | null;
    status?: LeadStatus;
    notes?: string | null;
  }): Lead {
    const id = randomUUID();
    const now = new Date();
    const lead = new Lead({
      id,
      name: props.name,
      email: props.email,
      phone: props.phone ?? null,
      source: props.source ?? null,
      status: props.status ?? LeadStatus.NEW,
      notes: props.notes ?? null,
      convertedAt: null,
      contactId: null,
      createdAt: now,
      updatedAt: now,
    });
    lead.addDomainEvent(new LeadCreatedEvent(id));
    return lead;
  }

  static reconstitute(props: {
    id: string;
    name: Name;
    email: Email;
    phone: Phone | null;
    source: LeadSource | null;
    status: LeadStatus;
    notes: string | null;
    convertedAt: Date | null;
    contactId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Lead {
    return new Lead(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name.value;
  }

  get email(): Email {
    return this.props.email;
  }

  get emailValue(): string {
    return this.props.email.value;
  }

  get phone(): Phone | null {
    return this.props.phone;
  }

  get phoneValue(): string | null {
    return this.props.phone?.value ?? null;
  }

  get source(): LeadSource | null {
    return this.props.source;
  }

  get sourceValue(): string | null {
    return this.props.source?.value ?? null;
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

  changeEmail(email: Email): void {
    (this.props as { email: Email }).email = email;
    this.addDomainEvent(new LeadUpdatedEvent(this.id));
  }

  changeName(name: Name): void {
    (this.props as { name: Name }).name = name;
    this.addDomainEvent(new LeadUpdatedEvent(this.id));
  }

  changePhone(phone: Phone | null): void {
    (this.props as { phone: Phone | null }).phone = phone;
    this.addDomainEvent(new LeadUpdatedEvent(this.id));
  }

  changeSource(source: LeadSource | null): void {
    (this.props as { source: LeadSource | null }).source = source;
    this.addDomainEvent(new LeadUpdatedEvent(this.id));
  }

  changeStatus(status: LeadStatus): void {
    (this.props as { status: LeadStatus }).status = status;
    this.addDomainEvent(new LeadUpdatedEvent(this.id));
  }

  changeNotes(notes: string | null): void {
    (this.props as { notes: string | null }).notes = notes;
    this.addDomainEvent(new LeadUpdatedEvent(this.id));
  }

  markAsConverted(contactId: string): void {
    (this.props as { contactId: string | null }).contactId = contactId;
    (this.props as { convertedAt: Date | null }).convertedAt = new Date();
    (this.props as { status: LeadStatus }).status = LeadStatus.CONVERTED;
  }

  /** Snapshot for persistence - use getters to avoid exposing mutable props */
  toPersistence(): {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    source: string | null;
    status: LeadStatus;
    notes: string | null;
    convertedAt: Date | null;
    contactId: string | null;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.props.id,
      name: this.props.name.value,
      email: this.props.email.value,
      phone: this.phoneValue,
      source: this.sourceValue,
      status: this.props.status,
      notes: this.props.notes,
      convertedAt: this.props.convertedAt,
      contactId: this.props.contactId,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
