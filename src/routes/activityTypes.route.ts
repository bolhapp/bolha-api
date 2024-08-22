import Router from "@koa/router";

import * as activityTypes from "@/modules/activityTypes.module";

export default (router: Router) => {
  router.get("/api/v1/activity-types", activityTypes.getAll);
};
