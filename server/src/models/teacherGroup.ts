import conn from "@/config/database";
import { User } from "@/types";

// Get all teachers assigned to a specific group
export const getGroupTeachers = async (groupId: number): Promise<User[]> => {
  try {
    const sql = `
      SELECT u.* 
      FROM users u
      JOIN teacher_groups tg ON u.user_id = tg.teacher_id
      WHERE tg.group_id = ? AND u.role = 'teacher'
    `;
    const [result] = await conn.execute(sql, [groupId]);
    return result as User[];
  } catch (error) {
    console.error(`Error fetching group teachers: ${error}`);
    throw error;
  }
};

// Assign a teacher to a group
export const assignTeacherToGroup = async (groupId: number, teacherId: number): Promise<boolean> => {
  try {
    // First verify the user is a teacher
    const [teacherCheck] = await conn.execute(
      "SELECT 1 FROM users WHERE user_id = ? AND role = 'teacher'", 
      [teacherId]
    );
    
    if ((teacherCheck as any[]).length === 0) {
      throw new Error("User is not a teacher");
    }
    
    const sql = "INSERT INTO teacher_groups (group_id, teacher_id) VALUES (?, ?)";
    await conn.execute(sql, [groupId, teacherId]);
    return true;
  } catch (error) {
    console.error(`Error assigning teacher to group: ${error}`);
    throw error;
  }
};

// Remove a teacher from a group
export const removeTeacherFromGroup = async (groupId: number, teacherId: number): Promise<boolean> => {
  try {
    const sql = "DELETE FROM teacher_groups WHERE group_id = ? AND teacher_id = ?";
    const [result] = await conn.execute(sql, [groupId, teacherId]);
    return (result as { affectedRows: number }).affectedRows > 0;
  } catch (error) {
    console.error(`Error removing teacher from group: ${error}`);
    throw error;
  }
};

// Check if a teacher is assigned to a group
export const isTeacherAssignedToGroup = async (groupId: number, teacherId: number): Promise<boolean> => {
  try {
    const sql = "SELECT 1 FROM teacher_groups WHERE group_id = ? AND teacher_id = ?";
    const [result] = await conn.execute(sql, [groupId, teacherId]);
    return (result as any[]).length > 0;
  } catch (error) {
    console.error(`Error checking teacher assignment: ${error}`);
    throw error;
  }
};