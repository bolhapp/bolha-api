import Router from "@koa/router";

import * as notifications from "@/modules/notifications.module";

export default (router: Router) => {
  router
    .get("/api/v1/notifications", notifications.getAll)

    .get("/api/v1/notifications/:id", notifications.getDetails)

    .patch("/api/v1/notifications/:id", notifications.update)

    .delete("/api/v1/notifications/:id", notifications.remove);
};
