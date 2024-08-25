import Joi from "joi";
import { File } from "@koa/multer";
import type { ParameterizedContext } from "koa";

import { getValidatedInput } from "@/utils/request";
import { ValidationError } from "@/exceptions";
import { UNEXPECTED_ERROR } from "@/errors/index.errors";
import { createActivity, deleteActivity, updateActivity } from "@/db/activity.db";
import { deleteUserActivity } from "@/db/userActivities.db";
import {
  createActivityRequest,
  deleteActivityRequest,
  updateActivityRequest,
} from "@/db/activityRequest.db";
import type { ActivityRequestState, BaseActivity } from "@/types/activity";
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
    activityTypes: Joi.string()
      .custom((value, helper) => {
        try {
          return value.split(",").map((i: string) => i.trim());
        } catch (_) {
          return helper.error("any.invalid");
        }
      })
      .required(),
    difficulty: Joi.number().max(5).min(0).required(),
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

export const remove = async (ctx: ParameterizedContext) => {
  const request = getValidatedInput(ctx.params, {
    id: Joi.string().max(256).required(),
  });

  await deleteActivity(request.id, ctx.user!.id);

  ctx.body = "ok";
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

interface ActivityRequestReplyPayload {
  id: string;
  status: ActivityRequestState;
  reason?: string;
}

export const reply = async (ctx: ParameterizedContext) => {
  const request = getValidatedInput<ActivityRequestReplyPayload>(
    { ...ctx.params, ...ctx.request.body },
    {
      id: Joi.string().max(256).required(),
      status: Joi.string().valid("accepted", "rejected").required(),
      reason: Joi.string(),
    },
  );

  const updateSuccessful = await updateActivityRequest(request.id, request.status, request.reason);

  if (!updateSuccessful) {
    throw new ValidationError(UNEXPECTED_ERROR);
  }

  ctx.body = "ok";
};

export const leave = async (ctx: ParameterizedContext) => {
  const request = getValidatedInput<ActivityRequestReplyPayload>(
    { ...ctx.params, ...ctx.request.query },
    {
      id: Joi.string().max(256).required(),
      status: Joi.string().valid("accepted", "pending").required(),
    },
  );

  let result;
  if (request.status === "accepted") {
    result = await deleteUserActivity(request.id, ctx.user!.id, true);
  } else {
    result = await deleteActivityRequest(request.id, ctx.user!.id);
  }

  if (!result) {
    throw new ValidationError(UNEXPECTED_ERROR);
  }

  ctx.body = "ok";
};
