import type { ParameterizedContext } from "koa";
import Joi from "joi";

import { getUser, userExists, updateUser } from "@/db/user.db";
import { emailValidator } from "@/utils/validators";
import { getValidatedInput } from "@/utils/request";
import type { User } from "@/types/user";
import { USER_GENDER } from "@/db/schemas/users.schema";
import { ValidationError } from "@/exceptions";
import { USER_NOT_FOUND } from "@/errors/user.errors";
import { EMAIL_TAKEN, INVALID_PARAMS } from "@/errors/auth.errors";
import { getUserActivities } from "@/db/activity.db";

export const userDetails = async (ctx: ParameterizedContext) => {
  const { email } = getValidatedInput<{ email: string }>(ctx.params, {
    email: emailValidator,
  });

  const user = await getUser(
    email,
    [],
    [
      "id",
      "name",
      "gender",
      "birthday",
      "token",
      "bio",
      "interests",
      "hobbies",
      "city",
      "picUrl",
      "picThumbnailUrl",
    ],
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

  const authedUser = getValidatedInput<{ email: string }>(ctx.params, {
    email: emailValidator,
  });

  const payload = getValidatedInput<Partial<User>>(ctx.request.body, {
    email: emailValidator.optional(),

    name: Joi.string().max(512),
    gender: Joi.string().valid(...USER_GENDER),
    birthday: Joi.date(),
    bio: Joi.string().max(5000),
    interests: Joi.array().items(Joi.string()),
    hobbies: Joi.array().items(Joi.string()),
    city: Joi.string().max(256),
  });

  if (!Object.keys(payload).length) {
    throw new ValidationError(INVALID_PARAMS);
  }

  if (!(await userExists(authedUser.email))) {
    throw new ValidationError(USER_NOT_FOUND);
  }

  if (payload.email) {
    const o = await getUser(payload.email, [], ["id"]);

    if (o?.id !== ctx.user!.id) {
      throw new ValidationError(EMAIL_TAKEN);
    }
  }

  ctx.body = await updateUser(authedUser.email, payload);
};

export const getActivities = async (ctx: ParameterizedContext) => {
  const payload = getValidatedInput<{ id: string }>(ctx.params, {
    id: Joi.string().required(),
  });

  ctx.body = await getUserActivities(payload.id);
};
