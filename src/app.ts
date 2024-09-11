import Sentry from "./services/sentry";

import Koa from "koa";
import bodyParser from "@koa/bodyparser";
import helmet from "koa-helmet";
import compress from "koa-compress";
import cors from "@koa/cors";

import { config } from "dotenv";

config();

const app = new Koa();

Sentry.setupKoaErrorHandler(app);

import "./db";

import passport from "./modules/passport.module";
import router from "./routes/index";
import errorHandler from "./middleware/error";
import { authenticated } from "./middleware/authentication";

app

  .use(compress())
  .use(cors())
  .use(helmet())
  .use(bodyParser())

  .use(passport.initialize())
  // custom middelware
  .use(authenticated())
  .use(errorHandler())
  // routes
  .use(router.allowedMethods())
  .use(router.routes());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
