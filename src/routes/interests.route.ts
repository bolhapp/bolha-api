import Router from "@koa/router";

import * as interests from "@/modules/interests.module";

export default (router: Router) => {
  router.get("/api/v1/interests", interests.getAll);
};
