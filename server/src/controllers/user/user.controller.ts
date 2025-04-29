import { Context } from "hono";
import {
  getAllUsersService,
  updateUserPasswordService,
  updateUserService,
  getUserProfileService,
  deleteUserService,
} from "@/services/user.service";
import { NotFoundError, BadRequestError } from "@/utils/error";

export const getAllUsers = async (c: Context) => {
  try {
    const users = await getAllUsersService();
    
    return c.json({
      success: true,
      message: "Get all users successfully",
      users,
    }, 200);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json({
        success: false,
        message: error.message,
        users: [],
      }, 200);
    }
    return c.json({
      success: false,
      message: "Failed to get users",
    }, 500);
  }
};

export const getUserProfile = async (c: Context) => {
  try {
    const user_id = c.get("user_id");
    const user = await getUserProfileService(Number(user_id));

    return c.json({
      success: true,
      message: "Get profile successfully",
      user,
    }, 200);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json({
        success: false,
        message: error.message,
        user: null,
      }, 404);
    }
    return c.json({
      success: false,
      message: "Failed to get user profile",
    }, 500);
  }
};

export const updateUserProfile = async (c: Context) => {
  try {
    const user_id = c.get("user_id");
    const userData = await c.req.json();
    const user = await updateUserService(Number(user_id), userData);

    return c.json({
      success: true,
      message: "Update profile successfully",
      user,
    }, 201);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json({
        success: false,
        message: error.message,
      }, 404);
    }
    if (error instanceof BadRequestError) {
      return c.json({
        success: false,
        message: error.message,
      }, 400);
    }
    return c.json({
      success: false,
      message: "Failed to update profile",
    }, 500);
  }
};

export const updateUserPassword = async (c: Context) => {
  try {
    const user_id = c.get("user_id");
    const { oldPassword, newPassword } = await c.req.json();
    await updateUserPasswordService(Number(user_id), oldPassword, newPassword);

    return c.json({
      success: true,
      message: "Update password successfully",
      newPassword
    }, 201);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json({
        success: false,
        message: error.message,
      }, 404);
    }
    if (error instanceof BadRequestError) {
      return c.json({
        success: false,
        message: error.message,
      }, 400);
    }
    return c.json({
      success: false,
      message: "Failed to update password",
    }, 500);
  }
};

export const deleteUser = async (c: Context) => {
  try {
    const user_id = c.req.param("user_id");
    await deleteUserService(Number(user_id));

    return c.json({
      success: true,
      message: "Delete user successfully",
    }, 200);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json({
        success: false,
        message: error.message,
      }, 404);
    }
    if (error instanceof BadRequestError) {
      return c.json({
        success: false,
        message: error.message,
      }, 400);
    }
    return c.json({
      success: false,
      message: "Failed to delete user",
    }, 500);
  }
};