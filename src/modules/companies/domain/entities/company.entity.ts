export interface CompanyEntity {
  readonly id: string;
  readonly name: string;
  readonly domain: string | null;
  readonly industry: string | null;
  readonly website: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Company {
  private constructor(readonly props: CompanyEntity) {}

  static create(props: CompanyEntity): Company {
    return new Company(props);
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
}
