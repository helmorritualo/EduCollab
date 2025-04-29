import { NotFoundError, BadRequestError } from "@/utils/error";
import { joinGroup, getGroupDetails, listUserGroups } from "@/models/groupMember";

export const joinGroupService = async (
  user_id: number,
  group_code: string   
) =>  {
  try {
    const group = await getGroupDetails(parseInt(group_code));
    if (!group) {
      throw new NotFoundError("Group not found");
    }
    const isJoined = await joinGroup(user_id, group_code);
    if (!isJoined) {
      throw new BadRequestError("Failed to join group");
    }
    return {
      group_id: group.group_id,
      group_code: group.group_code,
    }
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof BadRequestError) {
      throw error;
    }
    throw new Error("Failed to join group");
  }
};

export const getGroupDetailsService = async (
  group_id: number
) => {
  try {
    const group = await getGroupDetails(group_id);
    if (!group) {
      throw new NotFoundError("Group not found");
    }
    return group;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error("Failed to get group details");
  } 
};

export const listUserGroupsService = async (
  user_id: number
) => {
  try {
    const groups = await listUserGroups(user_id);
    if (!groups) {
      throw new NotFoundError("Groups not found");
    }
    return groups;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error("Failed to list user groups");
  }
};