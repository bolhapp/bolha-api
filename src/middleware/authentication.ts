import type { Middleware, ParameterizedContext, Next } from "koa";

import passport from "@/modules/passport.module";
import { ValidationError } from "@/exceptions";
import { UNAUTHENTICATED_ERROR, UNAUTHORIZED_ERROR } from "@/errors/auth.errors";
import Sentry, { logError } from "@/services/sentry";

export function authenticated(): Middleware {
  return async (ctx, next) => {
    if (!ctx.request.url.startsWith("/api")) {
      return await next();
    }

    // ignore auth routes, user is sobviously not authenticated
    if (
      ctx.request.url.includes("/auth") ||
      ctx.request.url.includes("/health") ||
      ctx.request.url.includes("/version")
    ) {
      return await next();
    }

    await passport.authenticate("jwt", { session: false }, async (err, user) => {
      if (!user) {
        throw new ValidationError(UNAUTHENTICATED_ERROR);
      }

      Sentry.setUser(user);

      ctx.user = user;

      await next();
    })(ctx, next);
  };
}

export async function adminAuthentication(ctx: ParameterizedContext, next: Next) {
  if (ctx.user!.type !== "admin") {
    logError("attempt to access admin only route", { extra: ctx });
    throw new ValidationError(UNAUTHORIZED_ERROR);
  }

  await next();
}
