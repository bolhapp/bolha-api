import Joi from "joi";
import { File } from "@koa/multer";
import type { ParameterizedContext } from "koa";

import { getValidatedInput } from "@/utils/request";
import { ValidationError } from "@/exceptions";
import { UNEXPECTED_ERROR } from "@/errors/index.errors";
import { ACTIVITY_DIFICULTY } from "@/db/schemas/activities.schema";
import { createActivity, createActivityRequest, updateActivity } from "@/db/activity.db";
import type { BaseActivity } from "@/types/activity";
import { uploadFile } from "@/services/firebase";

export const create = async (ctx: ParameterizedContext) => {
  const activity = getValidatedInput<BaseActivity>(ctx.request.body, {
    name: Joi.string().max(256).required(),
    description: Joi.string().required(),
    online: Joi.boolean().required(),
    address: Joi.when("online", {
      is: true,
      then: Joi.string().max(256).required(),
      otherwise: Joi.string().max(256),
    }),
    categories: Joi.string()
      .custom((value, helper) => {
        try {
          return value.split(",").map((i: string) => i.trim());
        } catch (err) {
          return helper.error("any.invalid");
        }
      })
      .required(),
    difficulty: Joi.string()
      .valid(...ACTIVITY_DIFICULTY)
      .required(),
    maxParticipants: Joi.number().required(),
    date: Joi.date().iso().min("now").required(),
    restrictions: Joi.string(),
    extraDetails: Joi.string(),
  });

  const newActivity = await createActivity(ctx.user!.id, activity);

  if (!newActivity) {
    throw new ValidationError(UNEXPECTED_ERROR);
  }

  // upload pics if they exist
  if (ctx.files?.length) {
    const urls = await Promise.all((ctx.files as File[]).map((f) => uploadFile(f, ctx.user!.id)));

    await updateActivity(newActivity.id, { pics: urls });
  }

  ctx.status = 201;
  ctx.body = newActivity;
};

export const signup = async (ctx: ParameterizedContext) => {
  const request = getValidatedInput(ctx.params, {
    id: Joi.string().max(256).required(),
  });

  const newRequest = await createActivityRequest(ctx.user!.id, request.id);

  if (!newRequest) {
    throw new ValidationError(UNEXPECTED_ERROR);
  }

  ctx.status = 201;
  ctx.body = newRequest;
};
