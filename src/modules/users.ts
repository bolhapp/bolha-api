import type { ParameterizedContext } from "koa";

import { getUser } from "@/db/user";
import { emailValidator } from "@/utils/validators";
import { getValidatedInput } from "@/utils/request";

export const userDetails = async (ctx: ParameterizedContext) => {
  const { email } = await getValidatedInput<{ email: string }>(ctx.params, {
    email: emailValidator,
  });

  ctx.body = await getUser(
    email,
    [],
    [
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
};
