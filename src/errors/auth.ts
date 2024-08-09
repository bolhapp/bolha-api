import type { ValidationErrorPayload } from "@/exceptions";

export const NOT_VERIFIED: ValidationErrorPayload = {
  statusCode: 403,
  statusMessage: "auth.not_verified",
  errorCode: 2002,
} as const;

export const INVALID_PARAMS: ValidationErrorPayload = {
  statusCode: 422,
  statusMessage: "auth.invalid_params",
  errorCode: 2002,
} as const;

export const EMAIL_TAKEN: ValidationErrorPayload = {
  statusCode: 422,
  statusMessage: "auth.email_taken",
  errorCode: 2002,
} as const;
