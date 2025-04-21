import {
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  isGroupMember,
} from "@/models/groupMember";
import { getGroupById } from "@/models/group";
import { getUserById } from "@/models/user";
import { User } from "@/types";
import { NotFoundError, BadRequestError } from "@/utils/error";

export const getGroupMembersService = async (
  groupId: number
): Promise<User[]> => {
  const group = await getGroupById(groupId);
  if (!group) {
    throw new NotFoundError("Group not found");
  }

  return await getGroupMembers(groupId);
};

export const addGroupMemberService = async (
  groupId: number,
  userId: number
): Promise<boolean> => {
  const group = await getGroupById(groupId);
  if (!group) {
    throw new NotFoundError("Group not found");
  }

  const user = await getUserById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const isMember = await isGroupMember(groupId, userId);
  if (isMember) {
    throw new BadRequestError("User is already a member of this group");
  }

  return await addGroupMember(groupId, userId);
};

export const removeGroupMemberService = async (
  groupId: number,
  userId: number
): Promise<boolean> => {
  const group = await getGroupById(groupId);
  if (!group) {
    throw new NotFoundError("Group not found");
  }

  const isMember = await isGroupMember(groupId, userId);
  if (!isMember) {
    throw new NotFoundError("User is not a member of this group");
  }

  return await removeGroupMember(groupId, userId);
};
