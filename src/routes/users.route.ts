import Router from "@koa/router";

import passport from "@/modules/passport";
import * as auth from "@/modules/auth";

export default (router: Router) => {
  router
    .post("/api/v1/auth/login", auth.login)

    .post("/api/v1/auth/register", auth.register)

    .get("/api/v1/auth/register/confirm", auth.registerConfirm)

    .patch("/api/v1/auth/reset-password", auth.resetPassword)

    .get("/api/v1/auth/reset-password/confirm", (ctx) => (ctx.body = "OK"))

    .post("/api/v1/auth/refresh", (ctx) => (ctx.body = "OK"))

    .delete("/api/v1/auth/logout", auth.logout)

    // oauth endpoints
    // google
    .get("/auth/google", passport.authenticate("google"))
    .get(
      "/auth/google/callback",
      passport.authenticate("google", { successRedirect: "/", failureRedirect: "/" }),
    )

    // facebook
    .get("/auth/facebook", passport.authenticate("facebook"))
    .get(
      "/auth/facebook/callback",
      passport.authenticate("facebook", { successRedirect: "/", failureRedirect: "/" }),
    )

    // twitter
    .get("/auth/twitter", passport.authenticate("twitter"))
    .get(
      "/auth/twitter/callback",
      passport.authenticate("twitter", { successRedirect: "/", failureRedirect: "/" }),
    )

    .get("/auth/linkedin", passport.authenticate("linkedin"))
    .get(
      "/auth/linkedin/callback",
      passport.authenticate("linkedin", { successRedirect: "/", failureRedirect: "/" }),
    );
};
