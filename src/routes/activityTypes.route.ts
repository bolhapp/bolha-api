import Router from "@koa/router";

import * as activityTypes from "@/modules/activityTypes.module";
import { adminAuthentication } from "@/middleware/authentication";

export default (router: Router) => {
  router.get("/api/v1/activity-types", activityTypes.getAll);

  router.post("/api/v1/activity-types", adminAuthentication, activityTypes.addActivityType);
};
