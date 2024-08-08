import Router from "@koa/router";

const { version } = require("../../package.json");

const router = new Router();

router
  .get("/api/v1/health", (ctx) => (ctx.body = "OK"))

  .get("/api/v1/version", (ctx) => (ctx.body = { minVersion: 1, version: Number(version) }));

export default router;
