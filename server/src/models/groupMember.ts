import conn from "@/config/database";
import { GroupWithCreator } from "@/types";

// join a group with specific group_code
export const joinGroup = async (
  user_id: number,
  group_code: string
): Promise<boolean> => {
  try {
    const sql = `
      INSERT INTO group_members (group_id, user_id)
      SELECT g.group_id, ?
      FROM groups g
      WHERE g.group_code = ?
    `;
    const [result] = await conn.execute(sql, [user_id, group_code]);
    return (result as { affectedRows: number }).affectedRows > 0;
  } catch (error) {
    console.error(`Error joining group: ${error}`);
    throw error;
  }
};

export const leaveGroup = async (
  user_id: number,
  group_id: number
): Promise<boolean> => {
  try {
    const sql = `
      DELETE FROM group_members
      WHERE group_id = ? AND user_id = ?
    `;
    const [result] = await conn.execute(sql, [group_id, user_id]);
    return (result as { affectedRows: number }).affectedRows > 0;
  } catch (error) {
    console.error(`Error leaving group: ${error}`);
    throw error;
  }
};

// Retrieves details of a specific group, including members and group description.
export const getGroupDetails = async (
  group_id: number
): Promise<(GroupWithCreator & { members: any[] }) | null> => {
  try {
    // First, get the basic group information
    const groupSql = `
      SELECT g.group_id, g.name, g.description, g.group_code, u.full_name as creator_name
      FROM groups g
      JOIN users u ON g.created_by = u.user_id
      WHERE g.group_id = ?
    `;
    const [groupResult] = await conn.execute(groupSql, [group_id]);
    const group = (groupResult as GroupWithCreator[])[0];

    if (!group) return null;

    // Then, get the members of the group
    const membersSql = `
      SELECT u.full_name, u.email, u.gender,  u.role
      FROM users u
      JOIN group_members gm ON u.user_id = gm.user_id
      WHERE gm.group_id = ?
    `;
    const [membersResult] = await conn.execute(membersSql, [group_id]);

    // Add members to the group object
    return {
      ...group,
      members: membersResult as any[],
    };
  } catch (error) {
    console.error(`Error fetching group details: ${error}`);
    throw error;
  }
};

// Lists all groups a specific user is a member of
export const listUserGroups = async (
  user_id: number
): Promise<GroupWithCreator[]> => {
  try {
    const sql = `
    SELECT g.group_id, g.name, g.description, g.group_code, g.created_by, u.full_name as creator_name
    FROM groups g
    JOIN users u ON g.created_by = u.user_id
    JOIN group_members gm ON g.group_id = gm.group_id
    WHERE gm.user_id = ?
  `;
    const [result] = await conn.execute(sql, [user_id]);
    return result as GroupWithCreator[];
  } catch (error) {
    console.error(`Error listing user groups: ${error}`);
    throw error;
  }
};
