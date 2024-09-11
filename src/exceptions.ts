import { logError } from "./services/sentry";

export interface ErrorField {
  field: string;
  error: string;
}

export interface ValidationErrorPayload {
  readonly errors?: ErrorField[];
  readonly statusCode?: number;
  readonly statusMessage?: string;
  readonly errorCode?: number;
}

export interface ErrorPayload {
  message?: string;
  payload?: Record<string, any>;
}

export class ValidationError extends Error {
  readonly errors?: ErrorField[];
  readonly statusCode: number = 500;
  readonly statusMessage: string = "unexpected_error";
  readonly errorCode?: number;

  constructor(
    { errors, statusCode, statusMessage, errorCode }: ValidationErrorPayload,
    error?: ErrorPayload,
  ) {
    super("Validation error");

    if (errors) {
      this.errors = errors;
    }

    if (statusCode) {
      this.statusCode = statusCode;
    }

    if (statusMessage) {
      this.statusMessage = statusMessage;
    }

    if (errorCode) {
      this.errorCode = errorCode;
    }

    logError(`SwValidation: ${statusMessage}`, {
      extra: { validationPayload: { errors, statusCode, statusMessage, errorCode }, error },
    });
  }
}
