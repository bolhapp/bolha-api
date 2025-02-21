import Router from "@koa/router";

import { version } from "root/package.json";

import addAuthRoutes from "./auth.route";
import addActivtyTypesRoutes from "./activityTypes.route";
import addUsersRoutes from "./users.route";
import addActivitiesRoutes from "./activities.route";
import addNotificationsRoutes from "./notifications.route";

const router = new Router();

router
  .get("/api/health", (ctx) => (ctx.body = "OK"))

  .get("/api/version", (ctx) => (ctx.body = { minVersion: 1, version: parseFloat(version) }));

addAuthRoutes(router);
addActivtyTypesRoutes(router);
addUsersRoutes(router);
addActivitiesRoutes(router);
addNotificationsRoutes(router);

export default router;
