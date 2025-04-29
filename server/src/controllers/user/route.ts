import { Hono } from "hono";
import { authenticate, requireAdmin } from "@/middlewares/authentication";
import {
  getAllUsers,
  getUserProfile,
  updateUserPassword,
  updateUserProfile,
  deleteUser,
} from "./user.controller";

const userRoutes = new Hono()
  .get("/users", authenticate, requireAdmin, getAllUsers)
  .get("/profile", authenticate, getUserProfile)
  .put("/profile", authenticate, updateUserProfile)
  .put("/user/change-password", authenticate, updateUserPassword)
  .delete("/user/:user_id", authenticate, requireAdmin, deleteUser);

export default userRoutes;
