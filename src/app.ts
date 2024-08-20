import dotenv from "dotenv";
import Koa from "koa";
import bodyParser from "@koa/bodyparser";
import helmet from "koa-helmet";
import compress from "koa-compress";
import cors from "@koa/cors";

dotenv.config();

import "./db";

import passport from "./modules/passport.module";
import router from "./routes/index";
import errorHandler from "./middleware/error";
import authenticationHandler from "./middleware/authentication";

const app = new Koa();

app

  .use(compress())
  .use(cors())
  .use(helmet())
  .use(bodyParser())

  .use(passport.initialize())
  // custom middelware
  .use(errorHandler())
  .use(authenticationHandler())
  // routes
  .use(router.allowedMethods())
  .use(router.routes());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
