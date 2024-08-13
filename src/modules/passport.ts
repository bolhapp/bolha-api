import passport from "koa-passport";
import { Strategy as JwtStrategy, ExtractJwt, type JwtFromRequestFunction } from "passport-jwt";
import type { Request } from "koa";

import { getUser } from "@/db/user";
import { UNEXPECTED_ERROR } from "@/errors";
import { ValidationError } from "@/exceptions";

const TOKEN_BLACKLIST: Record<string, number> = {};

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
  user: {
    email: string;
  };
  iat: number;
  exp: number;
  aud: string;
  iss: string;
  sub: string;
}

// custom jwtFromRequest to also check blacklist
const jwtFromRequest: JwtFromRequestFunction = (request: Request) => {
  const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

  if (!token) {
    return null;
  }

  if (token in TOKEN_BLACKLIST) {
    return null;
  }

  return token;
};

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: jwtFromRequest,
      secretOrKey: process.env.JWT_SECRET as string,
      issuer: "lfg",
      audience: "lfgapp",
    },
    async function (jwt: JwToken, done) {
      try {
        const user = await getUser(jwt.user.email);

        // for whatever reason, user doesn't exist in db anymore
        if (!user) {
          throw new ValidationError(UNEXPECTED_ERROR);
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

export const blacklistToken = (request: Request) => {
  const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

  if (token) {
    TOKEN_BLACKLIST[token] = Date.now();
  }
};

export default passport;
