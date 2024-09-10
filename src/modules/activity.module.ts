import Joi from "joi";
import { File } from "@koa/multer";
import type { ParameterizedContext } from "koa";

import { getValidatedInput } from "@/utils/request";
import { ValidationError } from "@/exceptions";
import { UNEXPECTED_ERROR } from "@/errors/index.errors";
import {
  createActivity,
  deleteActivity,
  getActivity,
  updateActivity,
  getActivities,
} from "@/db/activity.db";
import { deleteUserActivity } from "@/db/userActivities.db";
import {
  createActivityRequest,
  deleteActivityRequest,
  getActivityRequests,
  updateActivityRequest,
} from "@/db/activityRequest.db";
import type {
  ActivityRequestState,
  ActivityToUpdate,
  BaseActivity,
  GetActivitiesQuery,
} from "@/types/activity";
import { deleteFile, uploadFile } from "@/services/aws";
import { pageValidator, sortOrderValidator } from "@/utils/validators";
import { createNotification } from "@/modules/notifications.module";
import { buildImgUrl } from "@/utils";

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

    newActivity.pics = urls.map(buildImgUrl);
  }

  ctx.status = 201;
  ctx.body = newActivity;
};

export const remove = async (ctx: ParameterizedContext) => {
  const request = getValidatedInput(ctx.params, {
    id: Joi.string().max(256).required(),
  });

  const pics = await deleteActivity(request.id, ctx.user!.id);

  if (!pics) {
    throw new ValidationError(UNEXPECTED_ERROR);
  }

  // delete any files that may exist
  if (pics?.length) {
    await Promise.all([pics.map((f) => deleteFile(f))]);
  }

  ctx.body = "ok";
};

export const update = async (ctx: ParameterizedContext) => {
  const activity = getValidatedInput<ActivityToUpdate>(ctx.request.body, {
    name: Joi.string().max(256),
    description: Joi.string(),
    online: Joi.boolean(),
    address: Joi.string().max(256),
    activityTypes: Joi.string().custom((value, helper) => {
      try {
        return value.split(",").map((i: string) => i.trim());
      } catch (_) {
        return helper.error("any.invalid");
      }
    }),
    difficulty: Joi.number().max(5).min(0),
    maxParticipants: Joi.number(),
    date: Joi.date().iso().min("now"),
    restrictions: Joi.string(),
    extraDetails: Joi.string(),
    photosToRemove: Joi.string().custom((value, helper) => {
      try {
        return value.split(",").map((i: string) => i.trim());
      } catch (_) {
        return helper.error("any.invalid");
      }
    }),
  });

  const filePromises: Promise<any>[] = [];

  if (activity.photosToRemove?.length) {
    activity.photosToRemove.forEach((f) => filePromises.push(deleteFile(f)));
  }

  // upload pics if they exist
  if (ctx.files?.length) {
    (ctx.files as File[]).forEach((f) => filePromises.push(uploadFile(f, ctx.user!.id)));
  }

  if (filePromises.length) {
    // get activity pics because we wanna make sure we add to the pics array
    // if we're keeping any, or remove them from the array if we're not
    filePromises.splice(0, 0, getActivity(ctx.params.id, [], ["pics"]));

    const result = await Promise.all(filePromises);

    const existingPics = result[0]?.pics || [];

    activity.pics = [
      ...(activity.photosToRemove?.length
        ? existingPics.filter((p: string) => activity.photosToRemove.includes(p))
        : existingPics),
      ...result.filter((f) => typeof f === "string"),
    ];
  }

  const updated = await updateActivity(ctx.params.id, activity, ctx.user!.id);

  if (!updated) {
    throw new ValidationError(UNEXPECTED_ERROR);
  }

  ctx.body = updated.pics ? { ...updated, pics: updated.pics.map(buildImgUrl) } : updated;
};

export const getAll = async (ctx: ParameterizedContext) => {
  const payload = getValidatedInput<GetActivitiesQuery>(ctx.request.query, {
    page: pageValidator,
    sortOrder: sortOrderValidator,
    sortField: Joi.string().required(),
    query: Joi.string(),
    name: Joi.string(),
    description: Joi.string(),
    restrictions: Joi.string(),
    extraDetails: Joi.string(),
    activityType: Joi.string(),
    maxParticipants: Joi.number(),
    numParticipants: Joi.number(),
    difficulty: Joi.number(),
  });

  const result = await getActivities(payload);

  ctx.body = result.map((act) => {
    if (act.pics) {
      act.pics = act.pics.map(buildImgUrl);
    }

    return act;
  });
};

export const signup = async (ctx: ParameterizedContext) => {
  const request = getValidatedInput(ctx.params, { id: Joi.string().max(256).required() });

  const newRequest = await createActivityRequest(ctx.user!.id, request.id);

  if (!newRequest) {
    throw new ValidationError(UNEXPECTED_ERROR);
  }

  const activity = await getActivity<{ createdBy: string }>(request.id, [], ["createdBy"]);

  if (!activity) {
    throw new ValidationError(UNEXPECTED_ERROR);
  }

  await createNotification({ userId: activity.createdBy, type: "newRequest", payload: newRequest });

  ctx.status = 201;
  ctx.body = newRequest;
};

interface ActivityRequestReplyPayload {
  id: string;
  requestId: string;
  status: ActivityRequestState;
  reason?: string;
}

export const reply = async (ctx: ParameterizedContext) => {
  const request = getValidatedInput<ActivityRequestReplyPayload>(
    { requestId: ctx.params.requestId, ...ctx.request.body },
    {
      requestId: Joi.string().max(256).required(),
      status: Joi.string().valid("accepted", "rejected").required(),
      reason: Joi.string(),
    },
  );

  const updatedRequest = await updateActivityRequest(
    request.requestId,
    request.status,
    request.reason,
  );

  if (!updatedRequest) {
    throw new ValidationError(UNEXPECTED_ERROR);
  }

  await createNotification({
    userId: ctx.user!.id,
    type: request.status === "accepted" ? "requestAccepted" : "requestRejected",
    payload: updatedRequest,
  });

  ctx.body = "ok";
};

export const leave = async (ctx: ParameterizedContext) => {
  const request = getValidatedInput<{ id: string; status: "accepted" | "pending" }>(
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

  const activity = await getActivity<{ createdBy: string }>(request.id, [], ["createdBy"]);

  if (!activity) {
    throw new ValidationError(UNEXPECTED_ERROR);
  }

  await createNotification({ userId: activity.createdBy, type: "userLeft", payload: result });

  ctx.body = "ok";
};

export const getPendingRequests = async (ctx: ParameterizedContext) => {
  const payload = getValidatedInput<{ id: string; page: number }>(
    { ...ctx.params, ...ctx.request.query },
    {
      id: Joi.string().required(),
      page: pageValidator,
    },
  );

  const requests = await getActivityRequests(payload.id, payload.page);

  if (!requests) {
    throw new ValidationError(UNEXPECTED_ERROR);
  }

  ctx.body = requests.map((r) => {
    if (r.photo) {
      r.photo = buildImgUrl(r.photo);
    }

    return r;
  });
};
