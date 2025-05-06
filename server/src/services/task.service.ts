import {
  createTask as createTaskModel,
  updateTask as updateTaskModel,
  updateTaskStatus as updateTaskStatusModel,
  deleteTask as deleteTaskModel,
  getTaskById as getTaskByIdModel,
  getTasksByGroupId as getTasksByGroupIdModel,
  getTasksByUserId as getTasksByUserIdModel,
  getAllTasks as getAllTasksModel,
  isTaskCreator as isTaskCreatorModel,
} from "@/models/task";
import { Task } from "@/types";
import { NotFoundError, ForbiddenError } from "@/utils/error";

export const createTaskService = async (task: Task): Promise<number> => {
  try {
    return await createTaskModel(task);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }
    throw error;
  }
};

export const updateTaskService = async (task: Task, user_id: number, is_admin: boolean): Promise<boolean> => {
  try {
    // Check if task exists
    const existingTask = await getTaskByIdModel(task.task_id!);
    if (!existingTask) {
      throw new NotFoundError("Task not found");
    }

    // Check if user is authorized to update the task
    const isCreator = existingTask.created_by === user_id;
    if (!isCreator && !is_admin) {
      throw new ForbiddenError("You are not authorized to update this task");
    }

    return await updateTaskModel(task);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }
    throw error;
  }
};

export const updateTaskStatusService = async (task_id: number, status: string): Promise<boolean> => {
  try {
    // Check if task exists
    const existingTask = await getTaskByIdModel(task_id);
    if (!existingTask) {
      throw new NotFoundError("Task not found");
    }

    return await updateTaskStatusModel(task_id, status);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new Error(`Failed to update task status: ${error.message}`);
    }
    throw error;
  }
};

export const deleteTaskService = async (task_id: number, user_id: number, is_admin: boolean): Promise<boolean> => {
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
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
    throw error;
  }
};

export const getTaskByIdService = async (task_id: number) => {
  try {
    const task = await getTaskByIdModel(task_id);
    if (!task) {
      throw new NotFoundError("Task not found");
    }
    return task;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new Error(`Failed to get task by ID: ${error.message}`);
    }
    throw error;
  }
};

export const getTasksByGroupIdService = async (group_id: number) => {
  try {
    return await getTasksByGroupIdModel(group_id);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get tasks by group ID: ${error.message}`);
    }
    throw error;
  }
};

export const getTasksByUserIdService = async (user_id: number) => {
  try {
    return await getTasksByUserIdModel(user_id);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get tasks by user ID: ${error.message}`);
    }
    throw error;
  }
};

export const getAllTasksService = async () => {
  try {
    return await getAllTasksModel();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get all tasks: ${error.message}`);
    }
    throw error;
  }
};

export const isTaskCreatorService = async (task_id: number, user_id: number): Promise<boolean> => {
  try {
    return await isTaskCreatorModel(task_id, user_id);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to check task creator: ${error.message}`);
    }
    throw error;
  }
};