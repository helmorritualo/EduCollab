import { NotFoundError, BadRequestError } from "@/utils/error";
import { joinGroup, leaveGroup, getGroupDetails, listUserGroups } from "@/models/groupMember";
export const joinGroupService = async (user_id, group_code) => {
    try {
        const isJoined = await joinGroup(user_id, group_code);
        if (!isJoined) {
            throw new NotFoundError("Group not found or failed to join group");
        }
        return true;
    }
    catch (error) {
        if (error instanceof NotFoundError || error instanceof BadRequestError) {
            throw error;
        }
        throw new Error("Failed to join group");
    }
};
export const leaveGroupService = async (user_id, group_id) => {
    try {
        const hasLeft = await leaveGroup(user_id, group_id);
        if (!hasLeft) {
            throw new NotFoundError("Group not found or user is not a member of this group");
        }
        return true;
    }
    catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new Error("Failed to leave group");
    }
};
export const getGroupDetailsService = async (group_id) => {
    try {
        const group = await getGroupDetails(group_id);
        if (!group) {
            throw new NotFoundError("Group not found");
        }
        return group;
    }
    catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new Error("Failed to get group details");
    }
};
export const listUserGroupsService = async (user_id) => {
    try {
        const groups = await listUserGroups(user_id);
        if (!groups) {
            throw new NotFoundError("Groups not found");
        }
        return groups;
    }
    catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new Error("Failed to list user groups");
    }
};
