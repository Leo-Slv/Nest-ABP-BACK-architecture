import { randomUUID } from 'node:crypto';
import { AggregateRoot } from '../../../../shared/domain/aggregate-root.js';
import { ContactCreatedEvent } from '../events/contact-created.event.js';
import { ContactUpdatedEvent } from '../events/contact-updated.event.js';
import { ContactDeletedEvent } from '../events/contact-deleted.event.js';

export interface ContactProps {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string | null;
  companyId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** @deprecated use ContactProps */
export type ContactEntity = ContactProps;

/**
 * Contact aggregate root — mutações passam por métodos do agregado; eventos são coletados aqui.
 */
export class Contact extends AggregateRoot {
  private constructor(private props: ContactProps) {
    super();
  }

  static createNew(input: {
    name: string;
    email: string;
    phone?: string | null;
    role?: string | null;
    companyId?: string | null;
  }): Contact {
    const id = randomUUID();
    const now = new Date();
    const contact = new Contact({
      id,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      role: input.role ?? null,
      companyId: input.companyId ?? null,
      createdAt: now,
      updatedAt: now,
    });
    contact.addDomainEvent(new ContactCreatedEvent(id));
    return contact;
  }

  static reconstitute(props: ContactProps): Contact {
    return new Contact(props);
  }

  /** @deprecated use reconstitute */
  static create(props: ContactProps): Contact {
    return Contact.reconstitute(props);
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

  get role(): string | null {
    return this.props.role;
  }

  get companyId(): string | null {
    return this.props.companyId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  applyUpdate(input: {
    name?: string;
    email?: string;
    phone?: string | null;
    role?: string | null;
    companyId?: string | null;
  }): void {
    const p = this.props as Writable<ContactProps>;
    if (input.name !== undefined) p.name = input.name;
    if (input.email !== undefined) p.email = input.email;
    if (input.phone !== undefined) p.phone = input.phone;
    if (input.role !== undefined) p.role = input.role;
    if (input.companyId !== undefined) p.companyId = input.companyId;
    p.updatedAt = new Date();
    this.addDomainEvent(new ContactUpdatedEvent(this.id));
  }

  markDeleted(): void {
    this.addDomainEvent(new ContactDeletedEvent(this.id));
  }

  toPersistence(): ContactProps {
    return { ...this.props };
  }
}

type Writable<T> = { -readonly [P in keyof T]: T[P] };
