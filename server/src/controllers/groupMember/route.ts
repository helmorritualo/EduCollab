import { Hono } from "hono";
import { joinGroup, getGroupDetails, listUserGroups } from "./groupMember.controller";
import { authenticate } from "@/middlewares/authentication";

const groupMemberRoutes = new Hono()
  .post("/groups/join", authenticate, joinGroup)
  .get("/user/groups", authenticate, listUserGroups)
  .get("/groups/:group_id", authenticate, getGroupDetails);

export default groupMemberRoutes;