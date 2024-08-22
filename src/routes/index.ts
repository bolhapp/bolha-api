import Router from "@koa/router";

import addAuthRoutes from "./auth.route";
import addActivtyTypesRoutes from "./activityTypes.route";
import addUsersRoutes from "./users.route";
import addActivitiesRoutes from "./activities.route";

const router = new Router();

router
  .get("/api/v1/health", (ctx) => (ctx.body = "OK"))

  // todo: version should be in sync with package.json
  .get("/api/v1/version", (ctx) => (ctx.body = { minVersion: 1, version: 1 }));

addAuthRoutes(router);
addActivtyTypesRoutes(router);
addUsersRoutes(router);
addActivitiesRoutes(router);

export default router;
