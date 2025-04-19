import conn from "@/config/database";
import { User } from "@/types";

export const getGroupMembers = async (groupId: number): Promise<User[]> => {
  try {
    const sql = `
      SELECT u.* 
      FROM users u
      JOIN group_members gm ON u.user_id = gm.user_id
      WHERE gm.group_id = ?
    `;
    const [result] = await conn.execute(sql, [groupId]);
    return result as User[];
  } catch (error) {
    console.error(`Error fetching group members: ${error}`);
    throw error;
  }
};

export const addGroupMember = async (groupId: number, userId: number): Promise<boolean> => {
  try {
    const sql = "INSERT INTO group_members (group_id, user_id) VALUES (?, ?)";
    await conn.execute(sql, [groupId, userId]);
    return true;
  } catch (error) {
    console.error(`Error adding group member: ${error}`);
    throw error;
  }
};

export const removeGroupMember = async (groupId: number, userId: number): Promise<boolean> => {
  try {
    const sql = "DELETE FROM group_members WHERE group_id = ? AND user_id = ?";
    const [result] = await conn.execute(sql, [groupId, userId]);
    return (result as { affectedRows: number }).affectedRows > 0;
  } catch (error) {
    console.error(`Error removing group member: ${error}`);
    throw error;
  }
};

// Check if a user is a member of a group
export const isGroupMember = async (groupId: number, userId: number): Promise<boolean> => {
  try {
    const sql = "SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?";
    const [result] = await conn.execute(sql, [groupId, userId]);
    return (result as any[]).length > 0;
  } catch (error) {
    console.error(`Error checking group membership: ${error}`);
    throw error;
  }
};