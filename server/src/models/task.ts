import conn from "@/config/database";
import { Task, TaskWithDetails } from "@/types";

export const createTask = async (task: Task): Promise<number> => {
  try {
    const sql = `
      INSERT INTO tasks (title, description, status, due_date, group_id, created_by, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await conn.execute(sql, [
      task.title,
      task.description,
      task.status,
      task.due_date,
      task.group_id,
      task.created_by,
      task.assigned_to
    ]);
    return (result as { insertId: number }).insertId;
  } catch (error) {
    console.error(`Error creating task: ${error}`);
    throw error;
  }
};

export const updateTask = async (task: Task): Promise<boolean> => {
  try {
    const sql = `
      UPDATE tasks
      SET title = ?, description = ?, status = ?, due_date = ?, assigned_to = ?
      WHERE task_id = ? AND group_id = ?
    `;
    const [result] = await conn.execute(sql, [
      task.title,
      task.description,
      task.status,
      task.due_date,
      task.assigned_to,
      task.task_id,
      task.group_id
    ]);
    return (result as { affectedRows: number }).affectedRows > 0;
  } catch (error) {
    console.error(`Error updating task: ${error}`);
    throw error;
  }
};

export const updateTaskStatus = async (
  task_id: number,
  status: string
): Promise<boolean> => {
  try {
    const sql = `UPDATE tasks SET status = ? WHERE task_id = ?`;
    const [result] = await conn.execute(sql, [status, task_id]);
    return (result as { affectedRows: number }).affectedRows > 0;
  } catch (error) {
    console.error(`Error updating task status: ${error}`);
    throw error;
  }
};

export const deleteTask = async (task_id: number): Promise<boolean> => {
  try {
    const sql = `DELETE FROM tasks WHERE task_id = ?`;
    const [result] = await conn.execute(sql, [task_id]);
    return (result as { affectedRows: number }).affectedRows > 0;
  } catch (error) {
    console.error(`Error deleting task: ${error}`);
    throw error;
  }
};

export const getTaskById = async (task_id: number): Promise<TaskWithDetails | null> => {
  try {
    const sql = `
      SELECT t.*, 
             g.name as group_name,
             creator.full_name as creator_name,
             assignee.full_name as assignee_name
      FROM tasks t
      JOIN groups g ON t.group_id = g.group_id
      JOIN users creator ON t.created_by = creator.user_id
      LEFT JOIN users assignee ON t.assigned_to = assignee.user_id
      WHERE t.task_id = ?
    `;
    const [result] = await conn.execute(sql, [task_id]);
    return (result as TaskWithDetails[])[0] || null;
  } catch (error) {
    console.error(`Error fetching task: ${error}`);
    throw error;
  }
};

export const getTasksByGroupId = async (group_id: number): Promise<TaskWithDetails[]> => {
  try {
    const sql = `
      SELECT t.*, 
             creator.full_name as creator_name,
             assignee.full_name as assignee_name
      FROM tasks t
      JOIN users creator ON t.created_by = creator.user_id
      LEFT JOIN users assignee ON t.assigned_to = assignee.user_id
      WHERE t.group_id = ?
      ORDER BY t.due_date ASC
    `;
    const [result] = await conn.execute(sql, [group_id]);
    return result as TaskWithDetails[];
  } catch (error) {
    console.error(`Error fetching tasks by group: ${error}`);
    throw error;
  }
};

export const getTasksByUserId = async (user_id: number): Promise<TaskWithDetails[]> => {
  try {
    const sql = `
      SELECT t.*, 
             g.name as group_name,
             creator.full_name as creator_name,
             assignee.full_name as assignee_name
      FROM tasks t
      JOIN groups g ON t.group_id = g.group_id
      JOIN users creator ON t.created_by = creator.user_id
      LEFT JOIN users assignee ON t.assigned_to = assignee.user_id
      WHERE t.assigned_to = ?
      ORDER BY t.due_date ASC
    `;
    const [result] = await conn.execute(sql, [user_id]);
    return result as TaskWithDetails[];
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
             assignee.full_name as assignee_name
      FROM tasks t
      JOIN groups g ON t.group_id = g.group_id
      JOIN users creator ON t.created_by = creator.user_id
      LEFT JOIN users assignee ON t.assigned_to = assignee.user_id
      ORDER BY t.due_date ASC
    `;
    const [result] = await conn.execute(sql);
    return result as TaskWithDetails[];
  } catch (error) {
    console.error(`Error fetching all tasks: ${error}`);
    throw error;
  }
};

export const isTaskCreator = async (task_id: number, user_id: number): Promise<boolean> => {
  try {
    const sql = `SELECT * FROM tasks WHERE task_id = ? AND created_by = ?`;
    const [result] = await conn.execute(sql, [task_id, user_id]);
    return (result as any[]).length > 0;
  } catch (error) {
    console.error(`Error checking task creator: ${error}`);
    throw error;
  }
};