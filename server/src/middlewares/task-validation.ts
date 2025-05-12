import { Context, Next } from "hono";
import { BadRequestError, ForbiddenError } from "@/utils/error";
import conn from "@/config/database";

export const validateTaskCreation = async (c: Context, next: Next) => {
  try {
    // Check if body is already parsed by fileUploadMiddleware
    let body = c.get('parsedBody'); // Try to get body from context
    
    // If not found in context, try to parse it ourselves
    if (!body) {
      try {
        body = await c.req.json();
        console.log('Task body parsed from request - type:', typeof body, 'content:', JSON.stringify(body));
      } catch (error) {
        console.error('Error parsing request body:', error);
        throw new BadRequestError('Invalid JSON format in request body');
      }
    } else {
      console.log('Task body obtained from context - type:', typeof body, 'keys:', Object.keys(body));
      console.log('Task body content from context:', JSON.stringify(body));
    }
    
    // Extract and validate required fields with detailed logging
    console.log('Checking for title in:', body);
    const { title, description, status = "pending", due_date, group_id } = body;
    const user_id = c.get("user_id");

    // Validate required fields with detailed errors
    if (!title) throw new BadRequestError("Missing required field: title");
    if (!description) throw new BadRequestError("Missing required field: description");
    if (!due_date) throw new BadRequestError("Missing required field: due_date");
    if (!group_id) throw new BadRequestError("Missing required field: group_id");

    // Validate group_id is a number
    const groupIdNum = Number(group_id);
    if (isNaN(groupIdNum)) {
      throw new BadRequestError("group_id must be a number");
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
    // Parse request body with error handling
    let body;
    try {
      body = await c.req.json();
      console.log('Task update body received:', JSON.stringify(body));
    } catch (error) {
      console.error('Error parsing update request body:', error);
      throw new BadRequestError('Invalid JSON format in update request body');
    }
    
    // Extract and validate required fields
    const { title, description, status, due_date, group_id } = body;

    // Validate each required field with specific error messages
    if (!title) throw new BadRequestError("Missing required field: title");
    if (!description) throw new BadRequestError("Missing required field: description");
    if (!status) throw new BadRequestError("Missing required field: status");
    if (!due_date) throw new BadRequestError("Missing required field: due_date");
    if (!group_id) throw new BadRequestError("Missing required field: group_id");
    
    // Validate group_id is a number
    const groupIdNum = Number(group_id);
    if (isNaN(groupIdNum)) {
      throw new BadRequestError("group_id must be a number");
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
    // Get the body from the previous middleware instead of parsing it again
    const body = c.get("validatedTaskBody");
    if (!body) {
      throw new BadRequestError("Missing validated task body");
    }
    
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
    // Allow any group member to create tasks (both students and teachers)
    // This enables collaborative task management by students as requested

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
    // Body is already validated, no need to set it again

    await next();
  } catch (error) {
    if (error instanceof ForbiddenError || error instanceof BadRequestError) {
      throw error;
    }
    throw new BadRequestError("Invalid request body");
  }
};
