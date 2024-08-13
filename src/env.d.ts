import "koa";

import type { User } from "@/types/user";

declare module "koa" {
  interface DefaultState {
    user?: User;
  }

  interface BaseContext {
    user?: User;
  }
}
