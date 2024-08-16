import type { ValidationErrorPayload } from "@/exceptions";

export const USER_NOT_FOUND: ValidationErrorPayload = {
  statusCode: 404,
  statusMessage: "user.not_found",
  errorCode: 3001,
} as const;
