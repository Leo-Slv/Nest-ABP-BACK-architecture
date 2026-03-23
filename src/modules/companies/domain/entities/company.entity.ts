import { randomUUID } from 'node:crypto';
import { AggregateRoot } from '../../../../shared/domain/aggregate-root.js';
import { CompanyCreatedEvent } from '../events/company-created.event.js';
import { CompanyUpdatedEvent } from '../events/company-updated.event.js';
import { CompanyDeletedEvent } from '../events/company-deleted.event.js';

export interface CompanyProps {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  website: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** @deprecated use CompanyProps */
export type CompanyEntity = CompanyProps;

export class Company extends AggregateRoot {
  private constructor(private props: CompanyProps) {
    super();
  }

  static createNew(input: {
    name: string;
    domain?: string | null;
    industry?: string | null;
    website?: string | null;
  }): Company {
    const id = randomUUID();
    const now = new Date();
    const company = new Company({
      id,
      name: input.name,
      domain: input.domain ?? null,
      industry: input.industry ?? null,
      website: input.website ?? null,
      createdAt: now,
      updatedAt: now,
    });
    company.addDomainEvent(new CompanyCreatedEvent(id));
    return company;
  }

  static reconstitute(props: CompanyProps): Company {
    return new Company(props);
  }

  /** @deprecated use reconstitute */
  static create(props: CompanyProps): Company {
    return Company.reconstitute(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get domain(): string | null {
    return this.props.domain;
  }

  get industry(): string | null {
    return this.props.industry;
  }

  get website(): string | null {
    return this.props.website;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  applyUpdate(input: {
    name?: string;
    domain?: string | null;
    industry?: string | null;
    website?: string | null;
  }): void {
    const p = this.props as Writable<CompanyProps>;
    if (input.name !== undefined) p.name = input.name;
    if (input.domain !== undefined) p.domain = input.domain;
    if (input.industry !== undefined) p.industry = input.industry;
    if (input.website !== undefined) p.website = input.website;
    p.updatedAt = new Date();
    this.addDomainEvent(new CompanyUpdatedEvent(this.id));
  }

  markDeleted(): void {
    this.addDomainEvent(new CompanyDeletedEvent(this.id));
  }

  toPersistence(): CompanyProps {
    return { ...this.props };
  }
}

type Writable<T> = { -readonly [P in keyof T]: T[P] };
