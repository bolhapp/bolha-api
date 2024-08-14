import type { ValidationErrorPayload } from "@/exceptions";

export const NOT_VERIFIED: ValidationErrorPayload = {
  statusCode: 403,
  statusMessage: "auth.not_verified",
  errorCode: 2001,
} as const;

export const INVALID_PARAMS: ValidationErrorPayload = {
  statusCode: 422,
  statusMessage: "auth.invalid_params",
  errorCode: 2002,
} as const;

export const EMAIL_TAKEN: ValidationErrorPayload = {
  statusCode: 422,
  statusMessage: "auth.email_taken",
  errorCode: 2003,
} as const;

export const INVALID_TOKEN_PAYLOAD: ValidationErrorPayload = {
  statusCode: 422,
  statusMessage: "auth.INVALID_TOKEN_PAYLOAD",
  errorCode: 2004,
} as const;

export const UNAUTHENTICATED_ERROR: ValidationErrorPayload = {
  statusCode: 401,
  statusMessage: "auth.unauthenticated",
  errorCode: 2005,
} as const;
