import { Context } from "hono";
import {
  getAllGroupsService,
  getGroupByIdService,
  getGroupsByUserService,
  createGroupService,
  updateGroupService,
  deleteGroupService,
} from "@/services/groupServices";

export const getAllGroups = async (c: Context) => {
  const groups = await getAllGroupsService();

  return c.json(
    {
      success: true,
      message: "Groups retrieved successfully",
      groups,
    },
    200
  );
};

export const getGroupById = async (c: Context) => {
  const groupId = c.req.param("group_id");

  const group = await getGroupByIdService(Number(groupId));

  if (!group) {
    return c.json(
      {
        success: false,
        message: "Group not found",
      },
      404
    );
  }

  return c.json(
    {
      success: true,
      message: "Group retrieved successfully",
      group,
    },
    200
  );
};

export const getGroupsByUser = async (c: Context) => {
  const userId = c.req.param("user_id");

  const groups = await getGroupsByUserService(Number(userId));

  if (!groups || groups.length === 0) {
    return c.json(
      {
        success: false,
        message: "No groups found",
      },
      404
    );
  }

  return c.json({
    success: true,
    message: "Groups retrieved successfully",
    groups,
  });
};

export const createGroup = async (c: Context) => {
  const group = await c.req.json();

  const newGroup = await createGroupService(group);

  return c.json(
    {
      success: true,
      message: "Group created successfully",
      group: newGroup,
    },
    201
  );
};

export const updateGroup = async (c: Context) => {
  const groupId = c.req.param("group_id");
  const groupData = await c.req.json();

  const updatedGroup = await updateGroupService(Number(groupId), groupData);

  if (!updatedGroup) {
    return c.json(
      {
        success: false,
        message: "Group not found",
      },
      404
    );
  }

  return c.json(
    {
      success: true,
      message: "Group updated successfully",
      group: updatedGroup,
    },
    201  
  ) 
};

export const deleteGroup = async (c: Context) => {
  const groupId = c.req.param("group_id");

  const deletedGroup = await deleteGroupService(Number(groupId));

  if (!deletedGroup) {
    return c.json(
      {
        success: false,
        message: "Group not found",
      },
      404
    );
  } 

  return c.json(
    {
      success: true,
      message: "Group deleted successfully",
    }, 
    200
  )
}
