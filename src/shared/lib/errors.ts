export enum AppErrorCode {
  Validation = "validation_error",
  NotFound = "not_found",
  Authentication = "authentication_error",
  Authorization = "authorization_error",
  Unknown = "unknown_error",
}

export class AppError extends Error {
  public details: unknown;

  constructor(public code: AppErrorCode, message: string, details?: unknown) {
    super(message);
    this.details = details;
  }
}
