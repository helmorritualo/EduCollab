import { Hono } from "hono";
import { getGroupMembers, addGroupMember, removeGroupMember } from "./groupMember.controller";
import { authenticate } from "@/middlewares/authentication";

const groupMemberRouter = new Hono()
.get("/group-member", authenticate, getGroupMembers)
.post("/group-member/:group_id", authenticate, addGroupMember)
.delete("/group-member/:group_id/:user_id", authenticate, removeGroupMember);

export default groupMemberRouter;