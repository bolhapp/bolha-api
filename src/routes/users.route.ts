import Router from "@koa/router";

import * as users from "@/modules/users.module";

export default (router: Router) => {
  router
    .get("/api/v1/users/:id", users.userDetails)

    .patch("/api/v1/me", users.editUser)

    .get("/api/v1/me/activities", users.getOwnActivities);
};
