import { InvalidPhoneError } from '../../errors/invalid-phone.error.js';

export class Phone {
  private readonly _value: string;

  constructor(value: string) {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length < 10 || cleaned.length > 15) {
      throw new InvalidPhoneError(value);
    }
    this._value = value.trim();
  }

  get value(): string {
    return this._value;
  }
}
