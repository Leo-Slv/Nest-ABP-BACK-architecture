import { InvalidNameError } from '../../errors/invalid-name.error.js';

export class Name {
  private readonly _value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      throw new InvalidNameError(value);
    }
    this._value = trimmed;
  }

  get value(): string {
    return this._value;
  }
}
