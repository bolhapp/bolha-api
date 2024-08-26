import Router from "@koa/router";

import * as activity from "@/modules/activity.module";
import multer from "@/services/multer";

export default (router: Router) => {
  router
    .get("/api/v1/activities", activity.getAll)

    .post("/api/v1/activities", multer.any(), activity.create)

    .patch("/api/v1/activities/:id", multer.any(), activity.update)

    .delete("/api/v1/activities/:id", activity.remove)

    .delete("/api/v1/activities/:id/leave", activity.leave)

    .get("/api/v1/activities/:id/requests", activity.getPendingRequests)

    .post("/api/v1/activities/:id/requests/signup", activity.signup)

    .patch("/api/v1/activities/:id/requests/:requestId/reply", activity.reply);
};
