export abstract class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
