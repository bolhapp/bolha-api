import Router from "@koa/router";

import * as activity from "@/modules/activity.module";
import multer from "@/services/multer";

export default (router: Router) => {
  router
    .post("/api/v1/activities", multer.any(), activity.create)

    .patch("/api/v1/activities/:id", multer.any(), activity.update)

    .delete("/api/v1/activities/:id", activity.remove)

    .post("/api/v1/activities/:id/signup", activity.signup)

    .patch("/api/v1/activities/:id/reply", activity.reply)

    .delete("/api/v1/activities/:id/leave", activity.leave);
};
