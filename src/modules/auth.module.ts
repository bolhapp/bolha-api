import Joi from "joi";
import type { Next, ParameterizedContext } from "koa";
import dayjs from "dayjs";
import type { File } from "@koa/multer";

import { USER_GENDER } from "@/db/schemas/users.schema";
import { createUser, getUser, updateUser, userExists, verifyUser } from "@/db/user.db";
import { getValidatedInput } from "@/utils/request";
import { ValidationError } from "@/exceptions";
import { EMAIL_TAKEN, INVALID_TOKEN_PAYLOAD, INVALID_PARAMS } from "@/errors/auth.errors";
import type { AccountConfirmationPayload, UnregisteredUser } from "@/types/user";
import { UNEXPECTED_ERROR } from "@/errors/index.errors";
import { genToken } from "@/utils";
import { emailValidator, passwordValidator, tokenValidator } from "@/utils/validators";
import { sendEmail } from "@/services/email";
import i18n from "@/i18n";
import passport from "./passport.module";
import { uploadFile } from "@/services/firebase";

const authenticate = (ctx: ParameterizedContext, next: Next) => {
  // needs to be a separate promise because passport.authenticate only accepts callback, not promise
  // and decided to move to a different function for better readability
  return new Promise((resolve, reject) => {
    passport.authenticate("local", (err, user) => {
      if (err) {
        reject(err);
      } else {
        ctx.login(user); // This triggers the session creation
        resolve(user);
      }
    })(ctx, next);
  });
};

export const login = async (ctx: ParameterizedContext, next: Next) => {
  if (!ctx.request?.body) {
    throw new ValidationError(INVALID_PARAMS);
  }

  try {
    ctx.body = await authenticate(ctx, next);
  } catch (err) {
    throw new ValidationError(INVALID_PARAMS);
  }
};

export const register = async (ctx: ParameterizedContext) => {
  const user = await getValidatedInput<UnregisteredUser>(ctx.request.body, {
    email: emailValidator,
    password: passwordValidator,

    name: Joi.string().max(512),
    gender: Joi.string().valid(...USER_GENDER),
    birthday: Joi.date(),
    bio: Joi.string().max(5000),
    interests: Joi.array().items(Joi.string()),
    hobbies: Joi.array().items(Joi.string()),
    city: Joi.string().max(256),
  });

  if (await userExists(user.email)) {
    throw new ValidationError(EMAIL_TAKEN);
  }

  const token = `${genToken(32)}-${dayjs().add(2, "days").unix()}`;

  const newUser = await createUser(user, token);

  if (!newUser) {
    throw new ValidationError(UNEXPECTED_ERROR);
  }

  // upload pics if they exist
  if (ctx.files?.length) {
    const url = await uploadFile(ctx.request.file as File, ctx.user!.id);

    newUser["picUrl"] = url;

    await updateUser(newUser.id, { picUrl: url });
  }

  // TODO: disabled to be added at a later stage
  // const link = `${process.env.APP_BASE_URL}/api/v1/auth/register/confirm?token=${token}&email=${user.email}`;

  // await sendEmail(
  //   i18n.__("email.accountConfirm.subject"),
  //   { email: user.email, name: user.name },
  //   "userActionRequired",
  //   {
  //     greetings: i18n.__("email.greetings"),
  //     name: user.name || user.email.split("@")[0],
  //     body: i18n.__("email.accountConfirm.body"),
  //     body2: i18n.__("email.accountConfirm.body2"),
  //     confirmAccount: i18n.__("email.accountConfirm.confirmButton"),
  //     alternateLink: i18n.__mf("email.alternativeLink", { link }),
  //     link,
  //     linkTitle: i18n.__("email.accountConfirm.alternativeLinkTitle"),
  //   },
  // );

  ctx.status = 201;
  ctx.body = newUser;
};

export const registerConfirm = async (ctx: ParameterizedContext) => {
  const payload = await getValidatedInput<AccountConfirmationPayload>(ctx.request.query, {
    email: emailValidator,
    token: tokenValidator(),
  });

  // if 48h have passed since token was created
  // or if we couldn't update user in db, we return error
  if (
    dayjs.unix(Number(payload.token.split("-")[1])).isBefore(dayjs()) ||
    !(await verifyUser(payload))
  ) {
    // throw new ValidationError(INVALID_TOKEN_PAYLOAD);
    ctx.status = 422;
    ctx.body = i18n.__("email.invalidToken");
    return;
  }

  ctx.status = 200;
  ctx.body = i18n.__("email.accountConfirm.accountConfirmed");
};

export const logout = async (ctx: ParameterizedContext) => {
  await ctx.logout();

  ctx.body = "ok";
};

export const resetPassword = async (ctx: ParameterizedContext) => {
  const payload = await getValidatedInput<{ email: string }>(ctx.request.body, {
    email: emailValidator,
  });

  const user = await getUser(payload.email, [["verified", true]], ["name"]);

  if (!user) {
    ctx.body = "ok";
    ctx.status = 200;
    return;
  }

  const token = `${genToken(32)}-${dayjs().add(30, "minutes").unix()}`;
  const link = `${process.env.APP_BASE_URL}/api/v1/auth/reset-password/confirm?token=${token}&email=${user.email}`;

  await sendEmail(
    i18n.__("email.resetPassword.subject"),
    { email: payload.email },
    "userActionRequired",
    {
      greetings: i18n.__("email.greetings"),
      name: user.name || user.email.split("@")[0],
      body: i18n.__("email.resetPassword.body"),
      body2: i18n.__("email.resetPassword.body2"),
      confirmAccount: i18n.__("email.resetPassword.confirmButton"),
      alternateLink: i18n.__mf("email.alternativeLink", { link }),
      link,
      linkTitle: i18n.__("email.resetPassword.alternativeLinkTitle"),
    },
  );

  ctx.status = 200;
  ctx.body = "ok";
};

export const resetPasswordConfirm = async (ctx: ParameterizedContext) => {
  const payload = await getValidatedInput<AccountConfirmationPayload>(ctx.request.query, {
    email: emailValidator,
    token: tokenValidator(),
  });

  // if 48h have passed since token was created
  // or if we couldn't update user in db, we return error
  if (
    dayjs.unix(Number(payload.token.split("-")[1])).isBefore(dayjs()) ||
    !(await verifyUser(payload))
  ) {
    // throw new ValidationError(INVALID_ACC_CONFIRM_PAYLOAD);
    throw new ValidationError(INVALID_TOKEN_PAYLOAD);
  }

  ctx.status = 200;
  ctx.body = "ok";
};
