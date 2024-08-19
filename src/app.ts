import dotenv from "dotenv";
import Koa from "koa";
import bodyParser from "@koa/bodyparser";
import helmet from "koa-helmet";
import compress from "koa-compress";
import session from "koa-session";
import cors from "@koa/cors";

dotenv.config();

import "./db";

import passport from "./modules/passport.module";
import router from "./routes/index";
import errorHandler from "./middleware/error";
import authenticationHandler from "./middleware/authentication";

const app = new Koa();

app.keys = [process.env.SESSION_SECRET as string];

app

  .use(compress())
  .use(cors())
  .use(helmet())
  .use(
    session(
      {
        key: "sess",
        signed: true, // whether the cookie is signed to prevent tampering
        rolling: true,
        renew: true,
      },
      app,
    ),
  )
  .use(bodyParser())

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
