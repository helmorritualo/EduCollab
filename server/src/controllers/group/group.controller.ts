import { Context } from "hono";
import {
  getAllGroupsService,
  getGroupByIdService,
  createGroupService,
  updateGroupService,
  deleteGroupService,
} from "@/services/group.service";
import { NotFoundError, BadRequestError } from "@/utils/error";

export const getAllGroups = async (c: Context) => {
  try {
    const groups = await getAllGroupsService();
    
    return c.json(
      {
        success: true,
        message: "Groups retrieved successfully",
        groups,
      },
      200
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(
        {
          success: false,
          message: error.message,
          groups: [],
        },
        200
      );
    }
    return c.json(
      {
        success: false,
        message: "Failed to retrieve groups",
      },
      500
    );
  }
};

export const getGroupById = async (c: Context) => {
  try {
    const groupId = c.req.param("group_id");
    const group = await getGroupByIdService(Number(groupId));

    return c.json(
      {
        success: true,
        message: "Group retrieved successfully",
        group,
      },
      200
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(
        {
          success: false,
          message: error.message,
        },
        404
      );
    }
    return c.json(
      {
        success: false,
        message: "Failed to retrieve group",
      },
      500
    );
  }
};

export const createGroup = async (c: Context) => {
  try {
    const group = await c.req.json();
    const user_id = c.get("user_id");
    const groupWithCreator = { ...group, created_by: user_id };
    const newGroup = await createGroupService(groupWithCreator);

    return c.json(
      {
        success: true,
        message: "Group created successfully",
        group: newGroup,
      },
      201
    );
  } catch (error) {
    if (error instanceof BadRequestError) {
      return c.json(
        {
          success: false,
          message: error.message,
        },
        400
      );
    }
    return c.json(
      {
        success: false,
        message: "Failed to create group",
      },
      500
    );
  }
};

export const updateGroup = async (c: Context) => {
  try {
    const groupId = c.req.param("group_id");
    const groupData = await c.req.json();
    const updatedGroup = await updateGroupService(Number(groupId), groupData);
    return c.json(
      {
        success: true,
        message: "Group updated successfully",
        group: updatedGroup,
      },
      201
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(
        {
          success: false,
          message: error.message,
        },
        404
      );
    }
    if (error instanceof BadRequestError) {
      return c.json(
        {
          success: false,
          message: error.message,
        },
        400
      );
    }
    return c.json(
      {
        success: false,
        message: "Failed to update group",
      },
      500
    );
  }
};

export const deleteGroup = async (c: Context) => {
  try {
    const groupId = c.req.param("group_id");
    await deleteGroupService(Number(groupId));
    return c.json(
      {
        success: true,
        message: "Group deleted successfully",
      },
      200
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json(
        {
          success: false,
          message: error.message,
        },
        404
      );
    }
    return c.json(
      {
        success: false,
        message: "Failed to delete group",
      },
      500
    );
  }
};
