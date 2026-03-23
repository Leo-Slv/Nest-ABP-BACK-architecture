import { InvalidEmailError } from '../../errors/invalid-email.error.js';

export class Email {
  private readonly _value: string;

  constructor(value: string) {
    const trimmed = value.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      throw new InvalidEmailError(value);
    }
    this._value = trimmed;
  }

  get value(): string {
    return this._value;
  }
}
