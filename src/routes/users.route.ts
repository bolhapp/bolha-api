import Router from "@koa/router";
import passport from "koa-passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

import * as auth from "@/modules/auth";

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET as string,
      issuer: "accounts.examplesoft.com",
      audience: "yoursite.net",
    },
    function (jwt, done) {
      console.log("aqui", jwt);

      done(null, { id: "user" });
      // try {
      //   const user = await getUser(jwt, [], {
      //     password: users.password,
      //     id: users.id,
      //     verified: users.verified,
      //   });

      //   // error
      //   if (!user || !user.verified || !compareSync(ctx.request.body.password, user!.password)) {
      //     return done("foo", false);
      //     // throw Error("fail");
      //   }

      //   // @ts-ignore
      //   delete user!.password;

      //   done("foo", user);
      // } catch (err) {
      //   done("foo", false);
      // }
    },
  ),
);

export default (router: Router) => {
  router
    .post("/api/v1/auth/login", auth.login)

    .post("/api/v1/auth/register", auth.register)

    .post("/api/v1/auth/register/confirm", (ctx) => (ctx.body = "OK"))

    .post("/api/v1/auth/reset-password/confirm", (ctx) => (ctx.body = "OK"))

    .post("/api/v1/auth/refresh", (ctx) => (ctx.body = "OK"))

    .delete("/api/v1/auth/logout", (ctx) => (ctx.body = "OK"))

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
