import type { Middleware } from "koa";

import { UNAUTHENTICATED_ERROR } from "@/errors/auth";
import { ValidationError } from "@/exceptions";

export default function (): Middleware {
  return async (ctx, next) => {
    if (!ctx.isAuthenticated()) {
      throw new ValidationError(UNAUTHENTICATED_ERROR);
    }

    ctx.user = ctx.state.user;
    await next();
  };
}
