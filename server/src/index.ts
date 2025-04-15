import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Context, Next } from "hono";
import { logger } from "hono/logger";
import { jwt } from "hono/jwt";
import { cors } from "hono/cors";
import type { JwtVariables } from "hono/jwt";
import { errorHandlerMiddleware } from "./middlewares/error-handler";
import { routes } from "./controllers/routes";
import dotenv from "dotenv";
import { secureHeaders } from "hono/secure-headers";

dotenv.config();

const app = new Hono<{ Variables: JwtVariables }>();

//* middlewares
app.use(logger());
app.use("/api/*", cors());
app.use(secureHeaders());

app.use("/api/*", async (c: Context, next: Next) => {
  const path = c.req.path;

  //* Skip auth routes
  if (path === "/api/auth/login" || path === "/api/auth/register") {
    return next();
  }

  //* Apply JWT for all other routes
  return jwt({
    secret: process.env.JWT_SECRET as string,
  })(c, next);
});

app.onError(errorHandlerMiddleware);


//* routes
routes.forEach((route) => {
  app.route("/api", route);
});

//* convert process.env.PORT to number
const port = parseInt(process.env.PORT || "3000", 10);

serve({ fetch: app.fetch, port: port }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
