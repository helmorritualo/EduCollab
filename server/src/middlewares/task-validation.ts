import { Context, Next } from "hono";
import { BadRequestError } from "@/utils/error";

export const validateTaskCreation = async (c: Context, next: Next) => {
  try {
    const body = await c.req.json();
    const { title, description, status, due_date, group_id, assigned_to } = body;
    
    if (!title || !description || !status || !due_date || !group_id) {
      throw new BadRequestError("Missing required fields");
    }
    
    // Validate status values
    const validStatuses = ["pending", "in progress", "completed", "cancelled"];
    if (!validStatuses.includes(status.toLowerCase())) {
      throw new BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    // Validate due_date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(due_date)) {
      throw new BadRequestError("Invalid date format. Use YYYY-MM-DD");
    }
    
    // Store the validated body for the next middleware/handler
    c.set('validatedTaskBody', body);
    
    await next();
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error; 
    }
    throw new BadRequestError("Invalid request body");
  }
};

export const validateTaskUpdate = async (c: Context, next: Next) => {
  try {
    const body = await c.req.json();
    const { title, description, status, due_date, group_id, assigned_to } = body;
    
    if (!title || !description || !status || !due_date || !group_id) {
      throw new BadRequestError("Missing required fields");
    }
    
    // Validate status values
    const validStatuses = ["pending", "in progress", "completed", "cancelled"];
    if (!validStatuses.includes(status.toLowerCase())) {
      throw new BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    // Validate due_date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(due_date)) {
      throw new BadRequestError("Invalid date format. Use YYYY-MM-DD");
    }
    
    // Store the validated body for the next middleware/handler
    c.set('validatedTaskBody', body);
    
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
    
    if (!status) {
      throw new BadRequestError("Status is required");
    }
    
    // Validate status values
    const validStatuses = ["pending", "in progress", "completed", "cancelled"];
    if (!validStatuses.includes(status.toLowerCase())) {
      throw new BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    // Store the validated body for the next middleware/handler
    c.set('validatedTaskStatusBody', body);
    
    await next();
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error; 
    }
    throw new BadRequestError("Invalid request body");
  }
};