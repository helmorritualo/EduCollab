import { createTask as createTaskModel, updateTask as updateTaskModel, updateTaskStatus as updateTaskStatusModel, deleteTask as deleteTaskModel, getTaskById as getTaskByIdModel, getTasksByGroupId as getTasksByGroupIdModel, getTasksByUserId as getTasksByUserIdModel, getAllTasks as getAllTasksModel, isTaskCreator as isTaskCreatorModel, } from "@/models/task";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/utils/error";
import conn from "@/config/database";
export const createTaskService = async (task) => {
    try {
        // Validate required fields
        if (!task.title || !task.description || !task.group_id) {
            throw new BadRequestError("Missing required task fields");
        }
        // Validate status if provided
        const validStatuses = ["pending", "in progress", "completed", "cancelled"];
        if (task.status && !validStatuses.includes(task.status.toLowerCase())) {
            throw new BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
        }
        // If there's an assigned_to value, verify it's valid
        if (task.assigned_to) {
            const sql = `
        SELECT 1 FROM group_members
        WHERE group_id = ? AND user_id = ?
      `;
            const [result] = await conn.execute(sql, [
                task.group_id,
                task.assigned_to,
            ]);
            if (result.length === 0) {
                throw new BadRequestError("Assigned user must be a member of the group");
            }
        }
        return await createTaskModel(task);
    }
    catch (error) {
        if (error instanceof BadRequestError) {
            throw error;
        }
        if (error instanceof Error) {
            throw new BadRequestError(`Failed to create task: ${error.message}`);
        }
        throw new BadRequestError("Failed to create task");
    }
};
export const updateTaskService = async (task, user_id, is_admin) => {
    try {
        // Check if task exists
        const existingTask = await getTaskByIdModel(task.task_id);
        if (!existingTask) {
            throw new NotFoundError("Task not found");
        }
        // Check if user is authorized to update the task
        const isCreator = existingTask.created_by === user_id;
        if (!isCreator && !is_admin) {
            throw new ForbiddenError("Only the teacher who created the task or admin can update it");
        }
        // If there's an assigned_to value, verify it's valid
        if (task.assigned_to) {
            // Check if assigned user is a member of the group
            const sql = `
        SELECT 1 FROM group_members
        WHERE group_id = ? AND user_id = ?
      `;
            const [result] = await conn.execute(sql, [
                task.group_id,
                task.assigned_to,
            ]);
            if (result.length === 0) {
                throw new BadRequestError("Assigned user must be a member of the group");
            }
        }
        return await updateTaskModel(task);
    }
    catch (error) {
        if (error instanceof NotFoundError ||
            error instanceof ForbiddenError ||
            error instanceof BadRequestError) {
            throw error;
        }
        if (error instanceof Error) {
            throw new Error(`Failed to update task: ${error.message}`);
        }
        throw error;
    }
};
export const updateTaskStatusService = async (task_id, status, userId) => {
    try {
        // Check if task exists
        const existingTask = await getTaskByIdModel(task_id);
        if (!existingTask) {
            throw new NotFoundError("Task not found");
        }
        return await updateTaskStatusModel(task_id, status, userId);
    }
    catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }
        if (error instanceof Error) {
            throw new Error(`Failed to update task status: ${error.message}`);
        }
        throw error;
    }
};
export const deleteTaskService = async (task_id, user_id, is_admin) => {
    try {
        // Check if task exists
        const existingTask = await getTaskByIdModel(task_id);
        if (!existingTask) {
            throw new NotFoundError("Task not found");
        }
        // Check if user is authorized to delete the task
        const isCreator = existingTask.created_by === user_id;
        if (!isCreator && !is_admin) {
            throw new ForbiddenError("You are not authorized to delete this task");
        }
        return await deleteTaskModel(task_id);
    }
    catch (error) {
        if (error instanceof NotFoundError || error instanceof ForbiddenError) {
            throw error;
        }
        if (error instanceof Error) {
            throw new Error(`Failed to delete task: ${error.message}`);
        }
        throw error;
    }
};
export const getTaskByIdService = async (task_id) => {
    try {
        const task = await getTaskByIdModel(task_id);
        if (!task) {
            throw new NotFoundError("Task not found");
        }
        return task;
    }
    catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }
        if (error instanceof Error) {
            throw new Error(`Failed to get task by ID: ${error.message}`);
        }
        throw error;
    }
};
export const getTasksByGroupIdService = async (group_id, user_id) => {
    try {
        return await getTasksByGroupIdModel(group_id, user_id);
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get tasks by group ID: ${error.message}`);
        }
        throw error;
    }
};
export const getTasksByUserIdService = async (user_id) => {
    try {
        const tasks = await getTasksByUserIdModel(user_id);
        // Return empty array instead of throwing error when no tasks found
        return tasks;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get tasks by user ID: ${error.message}`);
        }
        throw error;
    }
};
export const getAllTasksService = async () => {
    try {
        return await getAllTasksModel();
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get all tasks: ${error.message}`);
        }
        throw error;
    }
};
export const isTaskCreatorService = async (task_id, user_id) => {
    try {
        return await isTaskCreatorModel(task_id, user_id);
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to check task creator: ${error.message}`);
        }
        throw error;
    }
};
