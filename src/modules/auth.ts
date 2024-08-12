import Joi from "joi";
import { compareSync } from "bcrypt";
import type { ParameterizedContext } from "koa";
import dayjs from "dayjs";

import { users, USER_GENDER } from "@/db/schemas/users.schema";
import { createUser, getUser, verifyUser } from "@/db/user";
import { getValidatedInput, sanitizeInput } from "@/utils/request";
import { ValidationError } from "@/exceptions";
import {
  EMAIL_TAKEN,
  INVALID_PARAMS,
  NOT_VERIFIED,
  INVALID_ACC_CONFIRM_PAYLOAD,
} from "@/errors/auth";
import type { AccountConfirmationPayload, BaseUser } from "@/types/user";
import { UNEXPECTED_ERROR } from "@/errors";
import { genToken } from "@/utils";
import { emailValidator, passwordValidator } from "@/utils/validators";
import { setupTokens } from "@/utils/token";
import { blacklistToken } from "@/modules/passport";
import { sendEmail } from "@/services/email";
import i18n from "@/i18n";

interface LoginPayload {
  email: string;
  password: string;
}

export const login = async (ctx: ParameterizedContext) => {
  if (!ctx.request?.body) {
    throw new ValidationError(INVALID_PARAMS);
  }

  const { email, password } = await getValidatedInput<LoginPayload>(
    {
      email: sanitizeInput(ctx.request.body.email),
      password: sanitizeInput(ctx.request.body.password),
    },
    {
      email: emailValidator,
      password: passwordValidator,
    },
  );

  const user = await getUser(email, [], {
    password: users.password,
    id: users.id,
    verified: users.verified,
  });

  if (!user || !compareSync(password, user.password)) {
    throw new ValidationError(INVALID_PARAMS);
  }

  if (!user.verified) {
    throw new ValidationError(NOT_VERIFIED);
  }

  // @ts-expect-error - will complain that password must be optional to be able to delete
  delete user.password;
  // @ts-expect-error - will complain that verified must be optional to be able to delete
  delete user.verified;

  ctx.body = { user, ...setupTokens(user) };
};

export const register = async (ctx: ParameterizedContext) => {
  const user = await getValidatedInput<BaseUser>(ctx.request.body, {
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

  const userExists = await getUser(user.email);

  if (userExists) {
    throw new ValidationError(EMAIL_TAKEN);
  }
  const token = `${genToken(32)}-${dayjs().add(2, "days").unix()}`;

  const newUser = await createUser(
    Object.entries(user).reduce((result, [field, value]) => {
      if (Array.isArray(value)) {
        value = value.map((v) => sanitizeInput(v));
      } else if (typeof value === "string") {
        value = sanitizeInput(value);
      }

      result[field as keyof BaseUser] = value;
      return result;
    }, {} as BaseUser),
    token,
  );

  if (!newUser) {
    throw new ValidationError(UNEXPECTED_ERROR);
  }

  const link = `${process.env.APP_BASE_URL}/api/v1/auth/register/confirm?token=${token}&email=${user.email}`;

  await sendEmail(
    i18n.__("email.accountConfirm.subject"),
    { email: user.email, name: user.name },
    "userActionRequired",
    {
      greetings: i18n.__("email.accountConfirm.greetings"),
      name: user.name || user.email.split("@")[0],
      body: i18n.__("email.accountConfirm.body"),
      body2: i18n.__("email.accountConfirm.body2"),
      confirmAccount: i18n.__("email.accountConfirm.confirmButton"),
      alternateLink: i18n.__mf("email.accountConfirm.alternativeLink", { link }),
      link,
      linkTitle: i18n.__("email.accountConfirm.alternativeLinkTitle"),
    },
  );

  ctx.status = 201;
  ctx.body = newUser;
};

export const registerConfirm = async (ctx: ParameterizedContext) => {
  const payload = await getValidatedInput<AccountConfirmationPayload>(ctx.request.query, {
    email: emailValidator,
    token: Joi.string()
      .required()
      .min(33)
      .pattern(/^[A-Za-z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{32}-\d{5,}$/),
  });

  // if 48h have passed since token was created
  // or if we couldn't update user in db, we return error
  if (
    dayjs.unix(Number(payload.token.split("-")[1])).isBefore(dayjs()) ||
    !(await verifyUser(payload))
  ) {
    // throw new ValidationError(INVALID_ACC_CONFIRM_PAYLOAD);
    ctx.status = 422;
    ctx.body = i18n.__("email.accountConfirm.invalidToken");
    return;
  }

  ctx.status = 200;
  ctx.body = i18n.__("email.accountConfirm.accountConfirmed");
};

export const logout = async (ctx: ParameterizedContext) => {
  blacklistToken(ctx.request);

  await ctx.logout();

  ctx.body = "ok";
};
