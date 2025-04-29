import { Context } from "hono";
import {
  joinGroupService,
  getGroupDetailsService,
  listUserGroupsService,
} from "@/services/groupMember.service";
import { NotFoundError, BadRequestError } from "@/utils/error";

export const joinGroup = async (c: Context) => {
  try {
    const { group_code } = await c.req.json();
    const user_id = c.get("user_id");

    await joinGroupService(user_id, group_code);

    return c.json(
      {
        success: true,
        message: "Joined successfully",
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
        message: "Failed to join group",
      },
      500
    );
  }
};

export const getGroupDetails = async (c: Context) => {
  try {
    const group_id = c.req.param("group_id");

    const group = await getGroupDetailsService(Number(group_id));

    return c.json({
      success: true,
      message: "Group details retrieved successfully",
      group,
    });
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
        message: "Failed to retrieve group details",
      },
      500
    );
  }
};

export const listUserGroups = async (c: Context) => {
  try {
    const user_id = c.get("user_id");

    const groups = await listUserGroupsService(user_id);

    return c.json({
      success: true,
      message: "Groups retrieved successfully",
      groups,
    });
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