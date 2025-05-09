import { Context, Next } from "hono";
import { BadRequestError, ForbiddenError } from "@/utils/error";
import conn from "@/config/database";

export const validateTaskCreation = async (c: Context, next: Next) => {
  try {
    const body = await c.req.json();
    const { title, description, status = "pending", due_date, group_id } = body;
    const user_id = c.get("user_id");

    if (!title || !description || !due_date || !group_id) {
      throw new BadRequestError("Missing required fields");
    }

    // Verify user is a member of the group
    const groupMemberSql = `
      SELECT gm.*, u.role
      FROM group_members gm
      JOIN users u ON u.user_id = gm.user_id
      WHERE gm.group_id = ? AND gm.user_id = ?
    `;
    const [groupMemberResult] = await conn.execute(groupMemberSql, [
      group_id,
      user_id,
    ]);
    if ((groupMemberResult as any[]).length === 0) {
      throw new ForbiddenError(
        "You must be a member of the group to create tasks"
      );
    }

    // Get all group members for task creation context
    const groupMembersSql = `SELECT user_id FROM group_members WHERE group_id = ?`;
    const [groupMembers] = await conn.execute(groupMembersSql, [group_id]);
    c.set("groupMembers", groupMembers);

    // Validate status values
    const validStatuses = ["pending", "in progress", "completed", "cancelled"];
    if (!validStatuses.includes(status.toLowerCase())) {
      throw new BadRequestError(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    // Validate due_date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(due_date)) {
      throw new BadRequestError("Invalid date format. Use YYYY-MM-DD");
    }

    c.set("validatedTaskBody", { ...body, status });
    await next();
  } catch (error) {
    if (error instanceof ForbiddenError || error instanceof BadRequestError) {
      throw error;
    }
    throw new BadRequestError("Invalid request body");
  }
};

export const validateTaskUpdate = async (c: Context, next: Next) => {
  try {
    const body = await c.req.json();
    const { title, description, status, due_date, group_id } = body;

    if (!title || !description || !status || !due_date || !group_id) {
      throw new BadRequestError("Missing required fields");
    }

    // Validate status values
    const validStatuses = ["pending", "in progress", "completed", "cancelled"];
    if (!validStatuses.includes(status.toLowerCase())) {
      throw new BadRequestError(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    // Validate due_date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(due_date)) {
      throw new BadRequestError("Invalid date format. Use YYYY-MM-DD");
    }

    // Store the validated body for the next middleware/handler
    c.set("validatedTaskBody", body);

    await next();
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw new BadRequestError("Invalid request body");
  }
};

export const validateTaskStatusUpdate = async (c: Context, next: Next) => {
  try {
    const body = await c.req.json();
    const { status } = body;
    const user_id = c.get("user_id");
    const user_role = c.get("user_role");
    const task_id = parseInt(c.req.param("task_id"));

    if (!status) {
      throw new BadRequestError("Status is required");
    }

    // Validate status values
    const validStatuses = ["pending", "in progress", "completed", "cancelled"];
    if (!validStatuses.includes(status.toLowerCase())) {
      throw new BadRequestError(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    // Get task details and check if user is a member of the group
    const taskSql = `
      SELECT t.*, gm.user_id as is_member, u.role as user_role
      FROM tasks t
      JOIN group_members gm ON t.group_id = gm.group_id
      JOIN users u ON u.user_id = ?
      WHERE t.task_id = ? AND gm.user_id = ?
    `;
    const [taskResult] = await conn.execute(taskSql, [
      user_id,
      task_id,
      user_id,
    ]);
    const tasks = taskResult as any[];

    if (tasks.length === 0) {
      throw new BadRequestError(
        "Task not found or you are not a member of this group"
      );
    }

    // Only allow students to update task status
    if (user_role !== "student") {
      throw new ForbiddenError("Only students can update task status");
    }

    // Store the validated body for the next middleware/handler
    c.set("validatedTaskStatusBody", body);

    await next();
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof ForbiddenError) {
      throw error;
    }
    throw new BadRequestError("Invalid request body");
  }
};

export const validateTaskCreationAuthorization = async (
  c: Context,
  next: Next
) => {
  try {
    const body = await c.req.json();
    const { group_id } = body;
    const user_id = c.get("user_id");
    const user_role = c.get("user_role");

    // Check if user is a member of the group and is a teacher
    const sql = `
      SELECT gm.user_id, u.role as user_role
      FROM group_members gm
      JOIN users u ON u.user_id = gm.user_id
      WHERE gm.group_id = ? AND gm.user_id = ?
    `;
    const [result] = await conn.execute(sql, [group_id, user_id]);
    const members = result as any[];

    if (members.length === 0) {
      throw new ForbiddenError(
        "You must be a member of the group to create tasks"
      );
    }

    const member = members[0];
    // Only allow teachers to create tasks
    if (member.user_role !== "teacher" && user_role !== "admin") {
      throw new ForbiddenError("Only teachers can create tasks");
    }

    // Get all group members for task assignment validation
    const membersSql = `
      SELECT u.user_id, u.full_name, u.role as user_role
      FROM group_members gm
      JOIN users u ON u.user_id = gm.user_id
      WHERE gm.group_id = ?
    `;
    const [membersResult] = await conn.execute(membersSql, [group_id]);
    const groupMembers = membersResult as any[];

    // Store group members for task creation
    c.set("groupMembers", groupMembers);
    c.set("validatedTaskBody", body);

    await next();
  } catch (error) {
    if (error instanceof ForbiddenError || error instanceof BadRequestError) {
      throw error;
    }
    throw new BadRequestError("Invalid request body");
  }
};
