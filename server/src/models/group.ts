import conn from "@/config/database";
import { Group, GroupWithCreator } from "@/types";

export const getAllGroups = async (): Promise<GroupWithCreator[]> => {
  try {
    const sql = `
      SELECT g.*, u.username, u.full_name, u.email 
      FROM groups g
      JOIN users u ON g.created_by = u.user_id
    `;
    const [result] = await conn.execute(sql);
    return result as GroupWithCreator[];
  } catch (error) {
    console.error(`Error fetching groups: ${error}`);
    throw error;
  }
};

export const getGroupById = async (id: number): Promise<GroupWithCreator | null> => {
  try {
    const sql = `
      SELECT g.*, u.username, u.full_name, u.email 
      FROM groups g
      JOIN users u ON g.created_by = u.user_id
      WHERE g.group_id = ?
    `;
    const [result] = await conn.execute(sql, [id]);
    return (result as GroupWithCreator[])[0] || null;
  } catch (error) {
    console.error(`Error fetching group: ${error}`);
    throw error;
  }
};

export const createGroup = async (group: Group): Promise<GroupWithCreator | null> => {
  try {
    const sql =
      "INSERT INTO groups (name, description, created_by) VALUES (?,?,?)";
    const [result] = await conn.execute(sql, [
      group.name,
      group.description,
      group.created_by,
    ]);

    const insertId = (result as { insertId: number }).insertId;
    return await getGroupById(insertId);
  } catch (error) {
    console.error(`Error creating group: ${error}`);
    throw error;
  }
};

export const updateGroup = async (
  groupId: number, 
  groupData: Partial<Group>
): Promise<GroupWithCreator | null> => {
  try {
    // Build the SET part of the SQL query dynamically based on provided fields
    const updateFields: string[] = [];
    const values: any[] = [];

    if (groupData.name !== undefined) {
      updateFields.push("name = ?");
      values.push(groupData.name);
    }

    if (groupData.description !== undefined) {
      updateFields.push("description = ?");
      values.push(groupData.description);
    }

    //! Don't allow updating created_by or created_at fields
    
    // If no fields to update, return the current group
    if (updateFields.length === 0) {
      return await getGroupById(groupId);
    }

    // Add the group ID to the values array
    values.push(groupId);

    const sql = `UPDATE groups SET ${updateFields.join(", ")} WHERE group_id = ?`;
    await conn.execute(sql, values);

    // Return the updated group
    return await getGroupById(groupId);
  } catch (error) {
    console.error(`Error updating group: ${error}`);
    throw error;
  }
};

export const deleteGroup = async (groupId: number): Promise<boolean> => {
  try {
    // Start a transaction to ensure all operations succeed or fail together
    await conn.beginTransaction();
    
    try {
      // First delete related records in teacher_groups
      await conn.execute("DELETE FROM teacher_groups WHERE group_id = ?", [groupId]);
      
      // Then delete related records in group_members
      await conn.execute("DELETE FROM group_members WHERE group_id = ?", [groupId]);
      
      // Delete related records in files
      await conn.execute("DELETE FROM files WHERE group_id = ?", [groupId]);
      
      // Delete related records in tasks
      await conn.execute("DELETE FROM tasks WHERE group_id = ?", [groupId]);
      
      // Delete related records in feedbacks
      await conn.execute("DELETE FROM feedbacks WHERE group_id = ?", [groupId]);
      
      // Finally delete the group itself
      const [result] = await conn.execute("DELETE FROM groups WHERE group_id = ?", [groupId]);
      
      // Commit the transaction
      await conn.commit();
      
      return (result as { affectedRows: number }).affectedRows > 0;
    } catch (error) {
      // If any error occurs, roll back the transaction
      await conn.rollback();
      throw error;
    }
  } catch (error) {
    console.error(`Error deleting group: ${error}`);
    throw error;
  }
};

export const getGroupsByUser = async (userId: number): Promise<GroupWithCreator[]> => {
  try {
    const sql = `
      SELECT g.*, u.username, u.full_name, u.email 
      FROM groups g
      JOIN users u ON g.created_by = u.user_id
      JOIN group_members gm ON g.group_id = gm.group_id
      WHERE gm.user_id = ?
    `;
    const [result] = await conn.execute(sql, [userId]);
    return result as GroupWithCreator[];
  } catch (error) {
    console.error(`Error fetching user's groups: ${error}`);
    throw error;
  }
};

export const getGroupsByTeacher = async (teacherId: number): Promise<GroupWithCreator[]> => {
  try {
    const sql = `
      SELECT g.*, u.username, u.full_name, u.email 
      FROM groups g
      JOIN users u ON g.created_by = u.user_id
      JOIN teacher_groups tg ON g.group_id = tg.group_id
      WHERE tg.teacher_id = ?
    `;
    const [result] = await conn.execute(sql, [teacherId]);
    return result as GroupWithCreator[];
  } catch (error) {
    console.error(`Error fetching teacher's groups: ${error}`);
    throw error;
  }
};

