import { DomainError } from '../../../../shared/errors/domain-error.js';

export class DealValue {
  private readonly _value: number;

  constructor(value: number) {
    if (typeof value !== 'number' || value < 0 || !Number.isFinite(value)) {
      throw new DomainError('Valor do deal inválido');
    }
    this._value = value;
  }

  get value(): number {
    return this._value;
  }
}
