import { getGroupTeachers, assignTeacherToGroup, removeTeacherFromGroup, isTeacherAssignedToGroup } from "@/models/teacherGroup";
import { getGroupById } from "@/models/group";
import { getUserById } from "@/models/user";
import { User } from "@/types";
import { NotFoundError, BadRequestError } from "@/utils/error";

export const getGroupTeachersService = async (groupId: number): Promise<User[]> => {
  const group = await getGroupById(groupId);
  if (!group) {
    throw new NotFoundError("Group not found");
  }
  
  return await getGroupTeachers(groupId);
};

export const assignTeacherToGroupService = async (groupId: number, teacherId: number): Promise<boolean> => {
  const group = await getGroupById(groupId);
  if (!group) {
    throw new NotFoundError("Group not found");
  }
  
  const user = await getUserById(teacherId);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  
  if (user.role !== 'teacher') {
    throw new BadRequestError("User is not a teacher");
  }
  
  const isAssigned = await isTeacherAssignedToGroup(groupId, teacherId);
  if (isAssigned) {
    throw new BadRequestError("Teacher is already assigned to this group");
  }
  
  return await assignTeacherToGroup(groupId, teacherId);
};

export const removeTeacherFromGroupService = async (groupId: number, teacherId: number): Promise<boolean> => {
  const group = await getGroupById(groupId);
  if (!group) {
    throw new NotFoundError("Group not found");
  }
  
  const isAssigned = await isTeacherAssignedToGroup(groupId, teacherId);
  if (!isAssigned) {
    throw new NotFoundError("Teacher is not assigned to this group");
  }
  
  return await removeTeacherFromGroup(groupId, teacherId);
};