import Joi from "joi";

import { ValidationError } from "@/exceptions";
import { INVALID_PARAMS } from "@/errors/auth.errors";
import { NO_PARAMS } from "@/errors/index.errors";

export const getValidatedInput = <T extends Record<string, any>>(
  payload: Record<string, any>,
  schema: Joi.PartialSchemaMap,
) => {
  if (!Object.keys(payload).length) {
    throw new ValidationError(NO_PARAMS);
  }

  const { value: result, error } = Joi.object<T>(schema).validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    throw new ValidationError({
      ...INVALID_PARAMS,
      errors: error.details.map((item) => ({ field: item.path.join("."), error: item.message })),
    });
  }

  return Object.entries(result).reduce<T>((result, [field, value]) => {
    if (Array.isArray(value)) {
      value = value.map((v) => (typeof v === "string" ? sanitizeInput(v) : v));
    } else if (typeof value === "string") {
      value = sanitizeInput(value);
    }

    result[field as keyof T] = value;
    return result;
  }, {} as T);
};

export const sanitizeInput = (input: any) => {
  if (!input) {
    return "";
  }

  input = input.toString().trim();

  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return input.replace(/[&<>"'/]/gi, (match: string) => map[match]);
};

export const desanitizeInput = (input: any) => {
  if (!input) {
    return "";
  }

  input = input.toString().trim();

  const map: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#x27;": "'",
    "&#x2F;": "/",
  };

  return input.replace(
    /(&amp;)|(&lt;)|(&gt;)|(&quot)|(&#x27;)|(&#x2F;)/gi,
    (match: string) => map[match],
  );
};
