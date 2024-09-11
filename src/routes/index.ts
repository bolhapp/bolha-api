import Router from "@koa/router";

import addAuthRoutes from "./auth.route";
import addActivtyTypesRoutes from "./activityTypes.route";
import addUsersRoutes from "./users.route";
import addActivitiesRoutes from "./activities.route";
import addNotificationsRoutes from "./notifications.route";

const router = new Router();

router
  .get("/api/v1/health", (ctx) => {
    throw new Error("snetry check");
    ctx.body = "OK";
  })

  // todo: version should be in sync with package.json
  .get("/api/v1/version", (ctx) => (ctx.body = { minVersion: 1, version: 1 }));

addAuthRoutes(router);
addActivtyTypesRoutes(router);
addUsersRoutes(router);
addActivitiesRoutes(router);
addNotificationsRoutes(router);

export default router;
