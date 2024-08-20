import passport from "koa-passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";

import { getUser } from "@/db/user.db";
import { UNEXPECTED_ERROR } from "@/errors/index.errors";
import { ValidationError } from "@/exceptions";
import { UNAUTHENTICATED_ERROR } from "@/errors/auth.errors";

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

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET as string,
      audience: ["lfgapp"],
      issuer: "lfgapp",
    },
    async function (jwt, done) {
      try {
        const user = await getUser(jwt.email);

        if (!user) {
          return done(UNAUTHENTICATED_ERROR, false);
        }

        done(null, user);
      } catch (err) {
        console.error(err);
        throw new ValidationError(UNEXPECTED_ERROR);
      }
    },
  ),
);

export default passport;
