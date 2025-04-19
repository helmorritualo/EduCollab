import { Context } from "hono";
import {
  getGroupMembersService,
  addGroupMemberService,
  removeGroupMemberService
} from "@/services/groupMemberServices";

export const getGroupMembers = async (c: Context) => {
  const groupId = c.req.param("group_id");
  
  const members = await getGroupMembersService(Number(groupId));
  
  return c.json({
    success: true,
    message: "Group members retrieved successfully",
    members
  }, 200);
};

export const addGroupMember = async (c: Context) => {
  const groupId = c.req.param("group_id");
  const { userId } = await c.req.json();
  
  await addGroupMemberService(Number(groupId), Number(userId));
  
  return c.json({
    success: true,
    message: "Member added to group successfully"
  }, 201);
};

export const removeGroupMember = async (c: Context) => {
  const groupId = c.req.param("group_id");
  const userId = c.req.param("user_id");
  
  await removeGroupMemberService(Number(groupId), Number(userId));
  
  return c.json({
    success: true,
    message: "Member removed from group successfully"
  }, 200);
};