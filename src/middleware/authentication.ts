import type { Middleware } from "koa";

import { UNAUTHENTICATED_ERROR } from "@/errors/auth.errors";
import { ValidationError } from "@/exceptions";

export default function (): Middleware {
  return async (ctx, next) => {
    // ignore auth routes, user is sobviously not authenticated
    if (ctx.request.url.includes("/auth")) {
      return await next();
    }

    if (!ctx.isAuthenticated()) {
      throw new ValidationError(UNAUTHENTICATED_ERROR);
    }

    ctx.user = ctx.state.user;
    await next();
  };
}
