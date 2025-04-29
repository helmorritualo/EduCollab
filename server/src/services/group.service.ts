import { NotFoundError, BadRequestError } from "@/utils/error";
import {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
} from "@/models/group";
import { Group, GroupWithCreator } from "@/types";

export const getAllGroupsService = async (): Promise<GroupWithCreator[]> => {
  try {
    const groups = await getAllGroups();
    if (!groups || groups.length === 0) {
      throw new NotFoundError("No groups found");
    }
    return groups as GroupWithCreator[];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new BadRequestError("Failed to fetch groups");
  }
};

export const getGroupByIdService = async (
  groupId: number
): Promise<GroupWithCreator | null> => {
  try {
    const group = await getGroupById(groupId);
    if (!group) {
      throw new NotFoundError("Group not found");
    }
    return group as GroupWithCreator;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new BadRequestError("Failed to fetch group");
  }
};

export const createGroupService = async (
  group: Group
): Promise<GroupWithCreator> => {

  // validate inputs
  if (!group.name || !group.description) {
    throw new BadRequestError("All required are fields");
  }

  try {
    const newGroup = await createGroup(group);
    if (!newGroup) {
      throw new BadRequestError("Failed to create group");
    }
    return newGroup;
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw new BadRequestError("Failed to create group");
  }
};

export const updateGroupService = async (
  groupId: number,
  groupData: Partial<Group>
): Promise<GroupWithCreator | null> => {
  // validate inputs
  if (!groupId ||!groupData) {
    throw new BadRequestError("All required are fields");
  }
  try {
    const updatedGroup = await updateGroup(groupId, groupData);
    if (!updatedGroup) {
      throw new NotFoundError("Group not found");
    }
    return updatedGroup;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new BadRequestError("Failed to update group");
  }
};

export const deleteGroupService = async (groupId: number): Promise<boolean> => {
  try {
    const deleted = await deleteGroup(groupId);
    if (!deleted) {
      throw new NotFoundError("Group not found");
    }
    return true;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new BadRequestError("Failed to delete group");
  }
};

