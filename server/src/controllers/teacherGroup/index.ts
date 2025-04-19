import { Context } from "hono";
import {
  getGroupTeachersService,
  assignTeacherToGroupService,
  removeTeacherFromGroupService
} from "@/services/teacherGroupServices";

export const getGroupTeachers = async (c: Context) => {
  const groupId = c.req.param("group_id");
  
  const teachers = await getGroupTeachersService(Number(groupId));
  
  return c.json({
    success: true,
    message: "Group teachers retrieved successfully",
    teachers
  }, 200);
};

export const assignTeacherToGroup = async (c: Context) => {
  const groupId = c.req.param("group_id");
  const { teacherId } = await c.req.json();
  
  await assignTeacherToGroupService(Number(groupId), Number(teacherId));
  
  return c.json({
    success: true,
    message: "Teacher assigned to group successfully"
  }, 201);
};

export const removeTeacherFromGroup = async (c: Context) => {
  const groupId = c.req.param("group_id");
  const teacherId = c.req.param("teacher_id");
  
  await removeTeacherFromGroupService(Number(groupId), Number(teacherId));
  
  return c.json({
    success: true,
    message: "Teacher removed from group successfully"
  }, 200);
};