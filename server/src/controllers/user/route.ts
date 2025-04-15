import { Hono } from "hono";
import { authenticate, requireAdmin } from "@/middlewares/authentication";
import {
  getAllUsers,
  getUserProfile,
  updateUserPassword,
  updateUserProfile,
  deleteUser,
} from "./index";

const userRoutes = new Hono()
  .get("/users", authenticate, requireAdmin, getAllUsers)
  .get("/profile/:user_id", authenticate, getUserProfile)
  .put("/profile/:user_id", authenticate, updateUserProfile)
  .put("/user/:user_id/password", authenticate, updateUserPassword)
  .delete("/user/:user_id", authenticate, requireAdmin, deleteUser);

export default userRoutes;
