import { Hono } from "hono";
import {
  joinGroup,
  leaveGroup,
  getGroupDetails,
  listUserGroups,
} from "./groupMember.controller";
import { authenticate } from "@/middlewares/authentication";

const groupMemberRoutes = new Hono()
  .post("/groups/join", authenticate, joinGroup)
  .get("/user/groups", authenticate, listUserGroups)
  .get("/groups/:group_id/details", authenticate, getGroupDetails)
  .delete("/groups/:group_id/leave", authenticate, leaveGroup);

export default groupMemberRoutes;
