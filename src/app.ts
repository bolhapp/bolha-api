import dotenv from "dotenv";
import Koa from "koa";
import bodyParser from "@koa/bodyparser";
import helmet from "koa-helmet";
import compress from "koa-compress";
import cors from "@koa/cors";
import session from "koa-session";

dotenv.config();

import "./db";

import router from "./routes/index";
import passport from "./modules/passport";
import errorHandler from "./middleware/error";
import authenticationHandler from "./middleware/authentication";

const app = new Koa();

app.keys = [process.env.SESSION_SECRET as string];

app
  .use(bodyParser())
  .use(compress())
  .use(cors())
  .use(helmet())
  .use(session(app))
  .use(passport.initialize())
  .use(passport.session())
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
