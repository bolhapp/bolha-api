import Joi from "joi";
import type { ParameterizedContext } from "koa";

import { getValidatedInput } from "@/utils/request";
import { ValidationError } from "@/exceptions";
import { UNEXPECTED_ERROR } from "@/errors/index.errors";
import { ACTIVITY_DIFICULTY } from "@/db/schemas/activities.schema";
import { createActivity, updateActivity } from "@/db/activity.db";
import type { BaseActivity } from "@/types/activity";
import { uploadFile } from "@/services/firebase";
import { File } from "@koa/multer";

export const create = async (ctx: ParameterizedContext) => {
  const activity = await getValidatedInput<BaseActivity>(ctx.request.body, {
    name: Joi.string().max(256).required(),
    description: Joi.string().required(),
    online: Joi.boolean().required(),
    address: Joi.string().max(256).required(),
    categories: Joi.array().items(Joi.string().max(256)).required(),
    participants: Joi.array().items(Joi.string().max(256)).required(),
    maxParticipants: Joi.number().required(),
    difficulty: Joi.array().items(
      Joi.string()
        .max(15)
        .valid(...ACTIVITY_DIFICULTY)
        .required(),
    ),
    date: Joi.date().required(),
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
  ctx.body = 200;
};
