import Joi from "joi";
import { File } from "@koa/multer";
import type { ParameterizedContext } from "koa";

import { getValidatedInput } from "@/utils/request";
import { ValidationError } from "@/exceptions";
import { UNEXPECTED_ERROR } from "@/errors/index.errors";
import { ACTIVITY_DIFICULTY } from "@/db/schemas/activities.schema";
import { createActivity, updateActivity } from "@/db/activity.db";
import type { BaseActivity } from "@/types/activity";
import { uploadFile } from "@/services/firebase";
import { createUserActivity } from "@/db/userActivity.db";

export const create = async (ctx: ParameterizedContext) => {
  const activity = await getValidatedInput<BaseActivity>(ctx.request.body, {
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

  await createUserActivity(ctx.user!.id, newActivity.id);

  // upload pics if they exist
  if (ctx.files?.length) {
    const urls = await Promise.all((ctx.files as File[]).map((f) => uploadFile(f, ctx.user!.id)));

    await updateActivity(newActivity.id, { pics: urls });
  }

  ctx.status = 201;
  ctx.body = 200;
};
