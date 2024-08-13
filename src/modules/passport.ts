import passport from "koa-passport";
import { compareSync } from "bcrypt";
import { Strategy as LocalStrategy } from "passport-local";

import { emailValidator, passwordValidator } from "@/utils/validators";
import { getValidatedInput, sanitizeInput } from "@/utils/request";
import { getUser } from "@/db/user";
import { UNEXPECTED_ERROR } from "@/errors";
import { INVALID_PARAMS, NOT_VERIFIED } from "@/errors/auth";
import { ValidationError } from "@/exceptions";

passport.serializeUser((user, done) => {
  process.nextTick(() => {
    try {
      done(null, JSON.stringify(user));
    } catch (err) {
      // todo: log somewhere
      console.error(err);
      done(err);
    }
  });
});

passport.deserializeUser((user: string, done) => {
  process.nextTick(() => {
    try {
      done(null, JSON.parse(user));
    } catch (err) {
      // todo: log somewhere
      console.error(err);
      done(err);
    }
  });
});

interface LoginPayload {
  email: string;
  password: string;
}

passport.use(
  new LocalStrategy({ usernameField: "email" }, async function (email, password, done) {
    const payload = await getValidatedInput<LoginPayload>(
      {
        email: sanitizeInput(email),
        password: sanitizeInput(password),
      },
      {
        email: emailValidator,
        password: passwordValidator,
      },
    );

    try {
      const user = await getUser(
        payload.email,
        [],
        [
          "password",
          "id",
          "verified",
          "name",
          "gender",
          "birthday",
          "token",
          "bio",
          "interests",
          "hobbies",
          "city",
          "picUrl",
          "picThumbnailUrl",
        ],
      );

      if (!user || !compareSync(payload.password, user.password)) {
        throw new ValidationError(INVALID_PARAMS);
      }

      if (!user.verified) {
        throw new ValidationError(NOT_VERIFIED);
      }

      // @ts-expect-error - will complain that password must be optional to be able to delete
      delete user.password;
      // @ts-expect-error - will complain that verified must be optional to be able to delete
      delete user.verified;

      done(null, user);
    } catch (err) {
      console.error(err);
      throw new ValidationError(UNEXPECTED_ERROR);
    }
  }),
);

export default passport;
