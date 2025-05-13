import conn from "@/config/database";
import { generateGroupCode } from "@/helpers/generateGroupCode";
export const getAllGroups = async () => {
    try {
        const sql = `
      SELECT g.group_id, g.name, g.description, g.group_code, g.created_by, u.full_name AS creator_name
      FROM groups g
      JOIN users u ON g.created_by = u.user_id
    `;
        const [result] = await conn.execute(sql);
        return result;
    }
    catch (error) {
        console.error(`Error fetching groups: ${error}`);
        throw error;
    }
};
export const getGroupById = async (id) => {
    try {
        const sql = `
      SELECT g.*, u.full_name AS creator_name
      FROM groups g
      JOIN users u ON g.created_by = u.user_id
      WHERE g.group_id = ?
    `;
        const [result] = await conn.execute(sql, [id]);
        return result[0] || null;
    }
    catch (error) {
        console.error(`Error fetching group: ${error}`);
        throw error;
    }
};
export const createGroup = async (group) => {
    try {
        const group_code = generateGroupCode();
        // Check if group_code already exists
        // to avoid duplicate group codes
        const checkSql = "SELECT * FROM groups WHERE group_code =?";
        const [checkResult] = await conn.execute(checkSql, [group_code]);
        if (checkResult.length > 0) {
            throw new Error("Group code already exists");
        }
        const sql = "INSERT INTO groups (name, description, created_by, group_code) VALUES (?, ?, ?, ?)";
        const [result] = await conn.execute(sql, [
            group.name,
            group.description,
            group.created_by,
            group_code,
        ]);
        const insertId = result.insertId;
        // Add the creator as a member of the group
        const memberSql = "INSERT INTO group_members (group_id, user_id) VALUES (?, ?)";
        await conn.execute(memberSql, [insertId, group.created_by]);
        // Fetch the complete group data with creator information
        return await getGroupById(insertId);
    }
    catch (error) {
        console.error(`Error creating group: ${error}`);
        throw error;
    }
};
export const updateGroup = async (groupId, groupData) => {
    try {
        // Build the SET part of the SQL query dynamically based on provided fields
        const updateFields = [];
        const values = [];
        if (groupData.name !== undefined) {
            updateFields.push("name = ?");
            values.push(groupData.name);
        }
        if (groupData.description !== undefined) {
            updateFields.push("description = ?");
            values.push(groupData.description);
        }
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
    }
    catch (error) {
        console.error(`Error updating group: ${error}`);
        throw error;
    }
};
export const deleteGroup = async (groupId) => {
    try {
        const sql = `DELETE FROM groups WHERE group_id =?`;
        const [result] = await conn.execute(sql, [groupId]);
        return result.affectedRows > 0;
    }
    catch (error) {
        console.error(`Error deleting group: ${error}`);
        throw error;
    }
};
export const getGroupByName = async (name) => {
    try {
        const sql = `
      SELECT g.*, u.full_name AS creator_name
      FROM groups g
      JOIN users u ON g.created_by = u.user_id
      WHERE g.name = ?
    `;
        const [result] = await conn.execute(sql, [name]);
        const groups = result;
        return groups?.[0] || null;
    }
    catch (error) {
        console.error(`Error getting group by name: ${error}`);
        throw error;
    }
};
