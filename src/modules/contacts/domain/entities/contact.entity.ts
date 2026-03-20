export interface ContactEntity {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string | null;
  readonly role: string | null;
  readonly companyId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Contact {
  private constructor(readonly props: ContactEntity) {}

  static create(props: ContactEntity): Contact {
    return new Contact(props);
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
}
