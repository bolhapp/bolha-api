import Router from "@koa/router";

import addAuthRoutes from "./auth.route";
import addInterestsRoutes from "./interests.route";
import addUsersRoutes from "./users.route";

const { version } = require("../../package.json");

const router = new Router();

router
  .get("/api/v1/health", (ctx) => (ctx.body = "OK"))

  .get("/api/v1/version", (ctx) => (ctx.body = { minVersion: 1, version: Number(version) }));

addAuthRoutes(router);
addInterestsRoutes(router);
addUsersRoutes(router);

export default router;
