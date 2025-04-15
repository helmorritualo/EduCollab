import { Hono } from "hono";
import { registerHandler, loginHandler, refreshTokenHandler } from "./index";
import { validateLogin, validateRegister } from "@/middlewares/validation";
import { authenticateForRefreshToken } from "@/middlewares/authentication";

const authRoutes = new Hono()
  .post("/auth/login", validateLogin, loginHandler)
  .post("/auth/register", validateRegister, registerHandler)
  .post("/refresh-token", authenticateForRefreshToken, refreshTokenHandler);

export default authRoutes;