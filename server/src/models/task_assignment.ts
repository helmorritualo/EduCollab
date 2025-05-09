import conn from "@/config/database";

export const assignTaskToGroupMembers = async (
  taskId: number,
  groupId: number,
  createdBy: number
): Promise<void> => {
  try {
    // Get all student members of the group (excluding the creator)
    const getMembersSql = `
      SELECT gm.user_id
      FROM group_members gm
      JOIN users u ON u.user_id = gm.user_id
      WHERE gm.group_id = ?
      AND gm.user_id != ?
      AND u.role = 'student'
    `;
    const [members] = await conn.execute(getMembersSql, [groupId, createdBy]);

    // If there are members, create task assignments
    if ((members as any[]).length > 0) {
      const values = (members as any[]).map((member) => [
        taskId,
        member.user_id,
        "pending",
      ]);
      const assignSql = `
        INSERT INTO task_assignments (task_id, user_id, status)
        VALUES ${values.map(() => "(?, ?, ?)").join(",")}
      `;
      const params = values.flat();
      await conn.execute(assignSql, params);
    }
  } catch (error) {
    console.error(`Error assigning task to group members: ${error}`);
    throw error;
  }
};

export const getTaskAssignmentStatus = async (
  taskId: number,
  userId: number
): Promise<string | null> => {
  try {
    const sql = `
      SELECT status
      FROM task_assignments
      WHERE task_id = ? AND user_id = ?
    `;
    const [result] = await conn.execute(sql, [taskId, userId]);
    return (result as any[])[0]?.status || null;
  } catch (error) {
    console.error(`Error getting task assignment status: ${error}`);
    throw error;
  }
};

export const updateTaskAssignmentStatus = async (
  taskId: number,
  userId: number,
  status: string
): Promise<boolean> => {
  try {
    // Validate the status
    const validStatuses = ["pending", "in progress", "completed", "cancelled"];
    if (!validStatuses.includes(status.toLowerCase())) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    const sql = `
      UPDATE task_assignments
      SET status = ?
      WHERE task_id = ? AND user_id = ?
    `;
    const [result] = await conn.execute(sql, [status, taskId, userId]);
    return (result as { affectedRows: number }).affectedRows > 0;
  } catch (error) {
    console.error(`Error updating task assignment status: ${error}`);
    throw error;
  }
};

/**
 * Updates the assignment status when a student updates their task status
 * This ensures the task status and assignment status stay in sync
 */
export const syncTaskStatusWithAssignment = async (
  taskId: number,
  userId: number,
  status: string
): Promise<void> => {
  try {
    // Check if there's an assignment for this task and user
    const checkSql = `
      SELECT 1 FROM task_assignments
      WHERE task_id = ? AND user_id = ?
    `;
    const [checkResult] = await conn.execute(checkSql, [taskId, userId]);

    // If there's an assignment, update its status
    if ((checkResult as any[]).length > 0) {
      await updateTaskAssignmentStatus(taskId, userId, status);
    }
  } catch (error) {
    console.error(`Error syncing task status with assignment: ${error}`);
    throw error;
  }
};
