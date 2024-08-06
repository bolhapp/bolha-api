import Router from "@koa/router";

const router = new Router();

router.get("/api/v1/health", (ctx) => (ctx.body = "OK"));

router.get("/api/v1/version", (ctx) => (ctx.body = { minVersion: 1, version: 1 }));

export default router;
