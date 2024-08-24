import Router from "@koa/router";

import * as activity from "@/modules/activity.module";
import multer from "@/services/multer";

export default (router: Router) => {
  router
    .post("/api/v1/activities", multer.any(), activity.create)

    .post("/api/v1/activities/:id/signup", activity.signup)

    .patch("/api/v1/activities/:id/reply", activity.reply);
};
