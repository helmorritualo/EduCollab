import { Hono } from "hono";
import {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
} from "./group.controller";
import { authenticate } from "@/middlewares/authentication";

const groupRoutes = new Hono()
  .get("/groups", authenticate, getAllGroups)
  .get("/groups/:group_id", authenticate, getGroupById)
  .post("/groups", authenticate, createGroup)
  .put("/groups/:group_id", authenticate, updateGroup)
  .delete("/groups/:group_id", authenticate, deleteGroup);

export default groupRoutes;
