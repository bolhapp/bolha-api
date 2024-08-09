import Joi from "joi";
import { compareSync } from "bcrypt";

import { users } from "@/db/schemas/users.schema";
import { getUser } from "@/db/user";
import type { ParameterizedContext } from "koa";
import { getValidatedInput } from "@/utils/request";
import { ValidationError } from "@/exceptions";
import { INVALID_PARAMS, NOT_VERIFIED } from "@/errors/auth";

interface LoginPayload {
  email: string;
  password: string;
}

export const login = async (ctx: ParameterizedContext) => {
  const { email, password } = await getValidatedInput<LoginPayload>(ctx.request.body, {
    email: Joi.string().required(),

    password: Joi.string().required(),
  });

  const user = await getUser(email, [], {
    password: users.password,
    id: users.id,
    verified: users.verified,
  });

  if (!user || !compareSync(password, user.password)) {
    throw new ValidationError(INVALID_PARAMS);
  }

  if (!user.verified) {
    throw new ValidationError(NOT_VERIFIED);
  }

  // @ts-expect-error - will complain that password must be optional to be able to delete
  delete user.password;
};
