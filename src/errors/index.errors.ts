import { ValidationErrorPayload } from "@/exceptions";

export const NO_PARAMS: ValidationErrorPayload = {
  statusCode: 422,
  errorCode: 1001,
  statusMessage: "empty_body",
} as const;

export const UNEXPECTED_ERROR: ValidationErrorPayload = {
  statusCode: 500,
  errorCode: 1002,
  statusMessage: "unexpected_error",
} as const;

export const UNSUPPORTED_FORMAT: ValidationErrorPayload = {
  statusCode: 422,
  errorCode: 1003,
  statusMessage: "unsupported_format",
} as const;

export const INVALID_PARAMS: ValidationErrorPayload = {
  statusCode: 422,
  statusMessage: "invalid_params",
  errorCode: 1004,
} as const;

export const NOT_FOUND: ValidationErrorPayload = {
  statusCode: 404,
  statusMessage: "resource_not_found",
  errorCode: 1005,
} as const;
