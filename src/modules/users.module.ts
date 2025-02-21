import type { ParameterizedContext } from "koa";
import Joi from "joi";

import { getUser, updateUser, getOwnActivities } from "@/db/user.db";
import { emailValidator, pageValidator, sortOrderValidator } from "@/utils/validators";
import { getValidatedInput } from "@/utils/request";
import type { GetOwnActivitiesPayload, User } from "@/types/user";
import { USER_GENDER } from "@/db/schemas/users.schema";
import { ValidationError, BolhaError } from "@/exceptions";
import { USER_NOT_FOUND } from "@/errors/user.errors";
import { EMAIL_TAKEN } from "@/errors/auth.errors";
import { INVALID_PARAMS } from "@/errors/index.errors";
import { buildImgUrl } from "@/utils";

export const userDetails = async (ctx: ParameterizedContext) => {
  const { id } = getValidatedInput<{ id: string }>(ctx.params, {
    email: emailValidator,
  });

  const user = await getUser(id, [], ["id", "name", "gender", "birthday", "bio", "city", "picUrl"]);

  if (!user) {
    throw new ValidationError(USER_NOT_FOUND);
  }

  if (user.picUrl) {
    user.picUrl = buildImgUrl(user.picUrl);
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

  const updated = await updateUser(ctx.user!.email, payload);

  if (!updated) {
    throw new BolhaError("[user.module]: failed to update user", payload);
  }

  ctx.body = updated;
};

export const getActivities = async (ctx: ParameterizedContext) => {
  const payload = getValidatedInput<Omit<GetOwnActivitiesPayload, "userId">>(ctx.request.query, {
    page: pageValidator,
    sortOrder: sortOrderValidator,
    sortField: Joi.string().required(),
  });

  ctx.body = await getOwnActivities({ ...payload, userId: ctx.user!.id });
};
