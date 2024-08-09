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
