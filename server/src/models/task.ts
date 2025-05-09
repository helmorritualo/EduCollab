import conn from "@/config/database";
import { Task, TaskWithDetails } from "@/types";

import { assignTaskToGroupMembers } from "./task_assignment";

export const createTask = async (task: Task): Promise<number> => {
  try {
    const sql = `
      INSERT INTO tasks (title, description, status, due_date, group_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await conn.execute(sql, [
      task.title,
      task.description,
      task.status,
      task.due_date,
      task.group_id,
      task.created_by,
    ]);
    const taskId = (result as { insertId: number }).insertId;

    // Assign task to all students in the group
    await assignTaskToGroupMembers(taskId, task.group_id, task.created_by);

    return taskId;
  } catch (error) {
    console.error(`Error creating task: ${error}`);
    throw error;
  }
};

export const updateTask = async (task: Task): Promise<boolean> => {
  try {
    const sql = `
      UPDATE tasks
      SET title = ?, description = ?, status = ?, due_date = ?
      WHERE task_id = ? AND group_id = ?
    `;
    const [result] = await conn.execute(sql, [
      task.title,
      task.description,
      task.status,
      task.due_date,
      task.task_id,
      task.group_id,
    ]);
    return (result as { affectedRows: number }).affectedRows > 0;
  } catch (error) {
    console.error(`Error updating task: ${error}`);
    throw error;
  }
};

export const updateTaskStatus = async (
  taskId: number,
  status: string,
  userId: number
): Promise<boolean> => {
  try {
    // Verify user is a member of the task's group
    const checkSql = `
      SELECT t.group_id
      FROM tasks t
      JOIN group_members gm ON t.group_id = gm.group_id
      WHERE t.task_id = ? AND gm.user_id = ?
    `;
    const [checkResult] = await conn.execute(checkSql, [taskId, userId]);
    if ((checkResult as any[]).length === 0) {
      throw new Error(
        "User must be a member of the group to update task status"
      );
    }

    const sql = `UPDATE tasks SET status = ? WHERE task_id = ?`;
    const [result] = await conn.execute(sql, [status, taskId]);
    return (result as { affectedRows: number }).affectedRows > 0;
  } catch (error) {
    console.error(`Error updating task status: ${error}`);
    throw error;
  }
};

export const deleteTask = async (taskId: number): Promise<boolean> => {
  try {
    const sql = `DELETE FROM tasks WHERE task_id = ?`;
    const [result] = await conn.execute(sql, [taskId]);
    return (result as { affectedRows: number }).affectedRows > 0;
  } catch (error) {
    console.error(`Error deleting task: ${error}`);
    throw error;
  }
};

export const getTaskById = async (
  taskId: number
): Promise<TaskWithDetails | null> => {
  try {
    const sql = `
      SELECT t.*,
             g.name as group_name,
             creator.full_name as creator_name,
             f.file_id,
             f.original_filename,
             f.file_type as mimetype,
             f.file_size as size
      FROM tasks t
      JOIN groups g ON t.group_id = g.group_id
      JOIN users creator ON t.created_by = creator.user_id
      LEFT JOIN files f ON f.task_id = t.task_id
      WHERE t.task_id = ?
    `;
    const [result] = await conn.execute(sql, [taskId]);
    const row = (result as any[])[0];
    if (!row) return null;

    return {
      ...row,
      file: row.file_id
        ? {
            file_id: row.file_id,
            original_filename: row.original_filename,
            mimetype: row.mimetype,
            size: row.size,
          }
        : null,
    };
  } catch (error) {
    console.error(`Error fetching task: ${error}`);
    throw error;
  }
};

export const getTasksByGroupId = async (
  groupId: number,
  userId: number
): Promise<TaskWithDetails[]> => {
  try {
    const sql = `
      SELECT t.*,
             g.name as group_name,
             creator.full_name as creator_name,
             f.file_id,
             f.original_filename,
             f.file_type as mimetype,
             f.file_size as size
      FROM tasks t
      JOIN groups g ON t.group_id = g.group_id
      JOIN users creator ON t.created_by = creator.user_id
      JOIN group_members gm ON t.group_id = gm.group_id AND gm.user_id = ?
      LEFT JOIN files f ON f.task_id = t.task_id
      WHERE t.group_id = ? AND (t.assigned_to IS NULL OR t.assigned_to = ?)
      ORDER BY t.due_date ASC
    `;
    const [result] = await conn.execute(sql, [userId, groupId, userId]);

    // Transform the result to include file information
    return (result as any[]).map((row) => ({
      ...row,
      file: row.file_id
        ? {
            file_id: row.file_id,
            original_filename: row.original_filename,
            mimetype: row.mimetype,
            size: row.size,
          }
        : null,
    }));
  } catch (error) {
    console.error(`Error fetching tasks by group: ${error}`);
    throw error;
  }
};

export const getTasksByUserId = async (
  userId: number
): Promise<TaskWithDetails[]> => {
  try {
    const sql = `
      SELECT DISTINCT t.*,
             g.name as group_name,
             creator.full_name as creator_name,
             f.file_id,
             f.original_filename,
             f.file_type as mimetype,
             f.file_size as size,
             COALESCE(ta.status, 'pending') as assignment_status
      FROM tasks t
      JOIN groups g ON t.group_id = g.group_id
      JOIN users creator ON t.created_by = creator.user_id
      JOIN group_members gm ON t.group_id = gm.group_id AND gm.user_id = ?
      LEFT JOIN task_assignments ta ON t.task_id = ta.task_id AND ta.user_id = ?
      LEFT JOIN files f ON f.task_id = t.task_id
      WHERE gm.user_id = ? AND t.created_by != ?
      ORDER BY t.due_date ASC
    `;
    const [result] = await conn.execute(sql, [userId, userId, userId, userId]);

    // Transform the result to include file information and assignment status
    return (result as any[]).map((row) => ({
      ...row,
      file: row.file_id
        ? {
            file_id: row.file_id,
            original_filename: row.original_filename,
            mimetype: row.mimetype,
            size: row.size,
          }
        : null,
    }));
  } catch (error) {
    console.error(`Error fetching tasks by user: ${error}`);
    throw error;
  }
};

export const getAllTasks = async (): Promise<TaskWithDetails[]> => {
  try {
    const sql = `
      SELECT t.*,
             g.name as group_name,
             creator.full_name as creator_name,
             f.file_id,
             f.original_filename,
             f.file_type as mimetype,
             f.file_size as size
      FROM tasks t
      JOIN groups g ON t.group_id = g.group_id
      JOIN users creator ON t.created_by = creator.user_id
      LEFT JOIN files f ON f.task_id = t.task_id
      ORDER BY t.due_date ASC
    `;
    const [result] = await conn.execute(sql);

    // Transform the result to include file information
    return (result as any[]).map((row) => ({
      ...row,
      file: row.file_id
        ? {
            file_id: row.file_id,
            original_filename: row.original_filename,
            mimetype: row.mimetype,
            size: row.size,
          }
        : null,
    }));
  } catch (error) {
    console.error(`Error fetching all tasks: ${error}`);
    throw error;
  }
};

export const isTaskCreator = async (
  taskId: number,
  userId: number
): Promise<boolean> => {
  try {
    const sql = `
      SELECT 1 FROM tasks
      WHERE task_id = ? AND created_by = ?
    `;
    const [result] = await conn.execute(sql, [taskId, userId]);
    return (result as any[]).length > 0;
  } catch (error) {
    console.error(`Error checking task creator: ${error}`);
    throw error;
  }
};
