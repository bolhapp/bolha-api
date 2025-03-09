import Joi from "joi";
import type { ParameterizedContext } from "koa";

import { createActivityType, getActivityTypes } from "@/db/activityTypes.db";
import { getValidatedInput } from "@/utils/request";
import type { ActivityType } from "@/types/activtyType";

const getValidInt = (int?: string, fallback: number = 0): number => {
  try {
    const p = Number(int);

    if (!isNaN(p) && p >= 0) {
      return p;
    }
  } finally {
    // eslint-disable-next-line no-unsafe-finally
    return fallback;
  }
};

export const getAll = async (ctx: ParameterizedContext) => {
  const page = getValidInt(ctx.request?.query.page as string | undefined);
  const pageSize = getValidInt(ctx.request?.query.pageSize as string | undefined, 25);
  const data = await getActivityTypes(page, pageSize);
  ctx.body = data;
};

export const addActivityType = async (ctx: ParameterizedContext) => {
  const type = getValidatedInput<ActivityType>(ctx.request.body, {
    id: Joi.string().max(256).required(),
  });

  const newType = await createActivityType(type);

  ctx.status = 201;
  ctx.body = newType;
};
