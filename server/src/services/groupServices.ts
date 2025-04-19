import { NotFoundError, BadRequestError } from "@/utils/error";
import {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupsByUser,
} from "@/models/group";
import { GroupWithCreator } from "@/types";

export const getAllGroupsService = async (): Promise<GroupWithCreator[]> => {
  try {
    const groups = await getAllGroups();

    if (!groups || groups.length === 0) {
      throw new NotFoundError("No groups found");
    }

    return groups;
  } catch (error) {
    console.error(`Error fetching groups: ${error}`);
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw error;
  }
};

export const getGroupByIdService = async (
  groupId: number
): Promise<GroupWithCreator | null | undefined> => {
  try {
    const group = await getGroupById(groupId);

    if (!group) {
      throw new NotFoundError("Group not found");
    }

    return group;
  } catch (error) {
    console.error(`Error fetching group: ${error}`);
    if (error instanceof NotFoundError) {
      throw error;
   }
  }
};

export const createGroupService = async (
  group: GroupWithCreator 
): Promise<GroupWithCreator | null> => {
  try {
    const isGroupExists = await getGroupById(group.group_id);

    if (isGroupExists) {
      throw new BadRequestError("Group already exists");
    }

    const newGroup = await createGroup(group);

    return newGroup;

  } catch (error) {
    console.error(`Error creating group: ${error}`);
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw error;
  } 
};

export const updateGroupService = async (
  groupId: number,
  groupData: Partial<GroupWithCreator> 
): Promise<GroupWithCreator | null> => {
  try {
    const existingGroup = await getGroupById(groupId);
    if (!existingGroup) {
      throw new NotFoundError("Group not found");
    }
  
    const updatedGroup = await updateGroup(groupId, groupData);
    if (!updatedGroup) {
      throw new Error("Failed to update group");
    }
    
    return updatedGroup;
  } catch (error) {
    console.error(`Error updating group: ${error}`);
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw error;
  }
};

export const deleteGroupService = async (groupId: number): Promise<boolean> => {
  try {
    const existingGroup = await getGroupById(groupId);
    if (!existingGroup) {
      throw new NotFoundError("Group not found");
    }
    
    const result = await deleteGroup(groupId);
    if (!result) {
      throw new Error("Failed to delete group");
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting group: ${error}`);
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw error;
  }
};

export const getGroupsByUserService = async (userId: number): Promise<GroupWithCreator[]> => {
  try {
    const groups = await getGroupsByUser(userId);
    
    if (!groups || groups.length === 0) {
      throw new NotFoundError("No groups found for this user");
    }
    
    return groups;
  } catch (error) {
    console.error(`Error fetching user's groups: ${error}`);
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw error;
  }
};