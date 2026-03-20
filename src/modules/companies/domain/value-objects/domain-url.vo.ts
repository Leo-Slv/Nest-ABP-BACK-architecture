import { DomainError } from '../../../../shared/errors/domain-error.js';

export class DomainUrl {
  private readonly _value: string;

  constructor(value: string) {
    const trimmed = value.trim().toLowerCase();
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/;
    if (!trimmed || !domainRegex.test(trimmed)) {
      throw new DomainError('Domínio inválido');
    }
    this._value = trimmed;
  }

  get value(): string {
    return this._value;
  }
}
