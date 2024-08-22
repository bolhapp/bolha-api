import type { ParameterizedContext } from "koa";
import Joi from "joi";

import { getUser, updateUser } from "@/db/user.db";
import { emailValidator } from "@/utils/validators";
import { getValidatedInput } from "@/utils/request";
import type { User } from "@/types/user";
import { USER_GENDER } from "@/db/schemas/users.schema";
import { ValidationError } from "@/exceptions";
import { USER_NOT_FOUND } from "@/errors/user.errors";
import { EMAIL_TAKEN } from "@/errors/auth.errors";
import { INVALID_PARAMS } from "@/errors/index.errors";
import { getUserActivities } from "@/db/activity.db";

export const userDetails = async (ctx: ParameterizedContext) => {
  const { id } = getValidatedInput<{ id: string }>(ctx.params, {
    email: emailValidator,
  });

  const user = await getUser(
    id,
    [],
    ["id", "name", "gender", "birthday", "bio", "interests", "city", "picUrl"],
  );

  if (!user) {
    throw new ValidationError(USER_NOT_FOUND);
  }

  ctx.body = user;
};

export const editUser = async (ctx: ParameterizedContext) => {
  if (!ctx.request?.body) {
    throw new ValidationError(INVALID_PARAMS);
  }

  const payload = getValidatedInput<Partial<User>>(ctx.request.body, {
    email: emailValidator.optional(),

    name: Joi.string().max(512),
    gender: Joi.string().valid(...USER_GENDER),
    birthday: Joi.date(),
    bio: Joi.string().max(5000),
    interests: Joi.array().items(Joi.string()),
    city: Joi.string().max(256),
  });

  if (!Object.keys(payload).length) {
    throw new ValidationError(INVALID_PARAMS);
  }

  if (payload.email) {
    const o = await getUser(payload.email, [], ["id"]);

    if (o?.id !== ctx.user!.id) {
      throw new ValidationError(EMAIL_TAKEN);
    }
  }

  ctx.body = await updateUser(ctx.user!.email, payload);
};

export const getActivities = async (ctx: ParameterizedContext) => {
  const payload = getValidatedInput<{ id: string }>(ctx.params, {
    id: Joi.string().required(),
  });

  ctx.body = await getUserActivities(payload.id);
};
