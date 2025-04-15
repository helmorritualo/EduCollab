import { Context } from "hono";
import {
  getAllUsersService,
  updateUserPasswordService,
  updateUserService,
  getUserProfileService,
  deleteUserService,
} from "@/services/userServices";

export const getAllUsers = async (c: Context) => {
  const users = await getAllUsersService();

  return c.json({
    success: true,
    message: "Get all users successfully",
    users,
  }, 200);
};

export const getUserProfile = async (c: Context) => {
  const user_id = c.req.param("user_id");

  const user = await getUserProfileService(Number(user_id));

  return c.json({
    success: true,
    message: "Get profile successfully",
    user,
  }, 200);
};

export const updateUserProfile = async (c: Context) => {
  const user_id = c.req.param("user_id");
  const userData = await c.req.json();

  const user = await updateUserService(Number(user_id), userData);

  return c.json({
    success: true,
    message: "Update profile successfully",
    user,
  }, 201);
};

export const updateUserPassword = async (c: Context) => {
  const user_id = c.req.param("user_id");
  const { oldPassword, newPassword } = await c.req.json();

  await updateUserPasswordService(Number(user_id), oldPassword, newPassword);

  return c.json({
    success: true,
    message: "Update password successfully",
    newPassword
  }, 201);
};

export const deleteUser = async (c: Context) => {
  const user_id = c.req.param("user_id");

  await deleteUserService(Number(user_id));

  return c.json({
    success: true,
    message: "Delete user successfully",
  }, 200);
};