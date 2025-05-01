import { Hono } from "hono";
import { authenticate, requireAdmin } from "@/middlewares/authentication";
import {
  getAllUsers,
  getUserProfile,
  updateUserPassword,
  updateUserProfile,
  activateUser,
  deactivateUser,
} from "./user.controller";

const userRoutes = new Hono()
  .get("/users", authenticate, requireAdmin, getAllUsers)
  .get("/profile", authenticate, getUserProfile)
  .put("/profile", authenticate, updateUserProfile)
  .put("/user/change-password", authenticate, updateUserPassword)
  .put("/user/activate/:user_id", authenticate, requireAdmin, activateUser)
  .put("/user/deactivate/:user_id", authenticate, requireAdmin, deactivateUser);

export default userRoutes;
