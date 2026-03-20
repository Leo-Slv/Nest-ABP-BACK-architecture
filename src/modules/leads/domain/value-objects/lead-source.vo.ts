import { DomainError } from '../../../../shared/errors/domain-error.js';

export class LeadSource {
  private readonly _value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new DomainError('Fonte do lead inválida');
    }
    this._value = trimmed;
  }

  get value(): string {
    return this._value;
  }
}
