import { Hono } from "hono";
import {
  getAllGroups,
  getGroupById,
  getGroupsByUser,
  createGroup,
  updateGroup,
  deleteGroup,
} from "./group.controller";
import { authenticate } from "@/middlewares/authentication";

const groupRoutes = new Hono()
  .get("/groups", authenticate, getAllGroups)
  .get("/groups/:group_id", authenticate, getGroupById)
  .get("/groups/:user_id/user", authenticate, getGroupsByUser)
  .post("/groups", authenticate, createGroup)
  .put("/groups/:group_id", authenticate, updateGroup)
  .delete("/groups/:group_id", authenticate, deleteGroup);

export default groupRoutes;
