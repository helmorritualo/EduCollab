import { Hono } from "hono";
import { authenticate, requireAdmin } from "@/middlewares/authentication";
import {
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskById,
  getTasksByGroupId,
  getTasksByUserId,
  getAllTasks,
} from "./task.controller";
import {
  validateTaskCreation,
  validateTaskUpdate,
  validateTaskStatusUpdate,
  validateTaskCreationAuthorization,
} from "@/middlewares/task-validation";
import { fileUploadMiddleware } from "@/middlewares/file-upload";

const taskRoutes = new Hono()
  .get("/tasks/my-tasks", authenticate, getTasksByUserId)
  .post(
    "/tasks",
    authenticate,
    // Skip file upload middleware for simple task creation without files
    // fileUploadMiddleware, 
    validateTaskCreation,
    validateTaskCreationAuthorization,
    createTask
  )
  .put("/tasks/:task_id", authenticate, validateTaskUpdate, updateTask)
  .patch(
    "/tasks/:task_id/status",
    authenticate,
    validateTaskStatusUpdate,
    updateTaskStatus
  )
  .delete("/tasks/:task_id", authenticate, deleteTask)
  .get("/tasks/:task_id", authenticate, getTaskById)
  .get("/groups/:group_id/tasks", authenticate, getTasksByGroupId)
  .get("/tasks", authenticate, requireAdmin, getAllTasks);

export default taskRoutes;
