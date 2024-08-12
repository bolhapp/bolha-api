import Router from "@koa/router";
import passport from "koa-passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

import * as auth from "@/modules/auth";
import { getUser } from "@/db/user";
import { UNEXPECTED_ERROR } from "@/errors";
import { ValidationError } from "@/exceptions";

passport.serializeUser((user, done) => {
  try {
    done(null, JSON.stringify(user));
  } catch (err) {
    // todo: log somewhere
    console.error(err);
    done(err);
  }
});

passport.deserializeUser((user: string, done) => {
  try {
    done(null, JSON.parse(user));
  } catch (err) {
    // todo: log somewhere
    console.error(err);
    done(err);
  }
});

interface JwToken {
  email: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
  sub: string;
}

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET as string,
      issuer: "lfg",
      audience: "lfgapp",
    },
    async function (jwt: JwToken, done) {
      try {
        const user = await getUser(jwt.email);

        // for whatever reason, user doesn't exist in db anymore
        if (!user) {
          done(UNEXPECTED_ERROR, user);
        } else {
          done(null, user);
        }
      } catch (err) {
        console.error(err);
        throw new ValidationError(UNEXPECTED_ERROR);
      }
    },
  ),
);

export { passport };

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
