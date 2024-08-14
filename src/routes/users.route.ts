import Router from "@koa/router";

import * as users from "@/modules/users";

export default (router: Router) => {
  router.get("/api/v1/users/:email", users.userDetails);
};
