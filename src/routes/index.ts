import Router from "@koa/router";

import addUserRoutes from "./users.route";
import addInterestsRoutes from "./interests.route";

const { version } = require("../../package.json");

const router = new Router();

router
  .get("/api/v1/health", (ctx) => (ctx.body = "OK"))

  .get("/api/v1/version", (ctx) => (ctx.body = { minVersion: 1, version: Number(version) }));

addUserRoutes(router);
addInterestsRoutes(router);

export default router;
