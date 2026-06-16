/** Unified application error for the HTTP layer. Static factories only —
 * deep code (store internals, verifiers) throws plain Error; only the HTTP
 * boundary speaks AppError. */

export class AppError extends Error {
  readonly statusCode: number;

  private constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    Error.captureStackTrace?.(this, this.constructor);
  }

  /** 404 — the resource doesn't exist. */
  static notFound(message = 'not found'): AppError {
    return new AppError(404, message);
  }

  /** 500 — something unexpected broke. */
  static internal(message: string): AppError {
    return new AppError(500, message);
  }

  /** The wire envelope — byte-identical to the pre-refactor response bodies. */
  toJSON(): { error: string } {
    return { error: this.message };
  }
}
