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

    .post("/api/v1/auth/register", (ctx) => (ctx.body = "OK"))

    .post("/api/v1/auth/register/confirm", (ctx) => (ctx.body = "OK"))

    .post("/api/v1/auth/reset-password/confirm", (ctx) => (ctx.body = "OK"))

    .post("/api/v1/auth/refresh", (ctx) => (ctx.body = "OK"))

    .delete("/api/v1/auth/logout", (ctx) => (ctx.body = "OK"))

    .get(
      "protected",
      passport.authenticate("jwt", { session: false }),
      (ctx) => (ctx.body = "yup"),
    );
};
