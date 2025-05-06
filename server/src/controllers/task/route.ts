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
import { validateTaskCreation, validateTaskUpdate, validateTaskStatusUpdate } from "@/middlewares/task-validation";

const taskRoutes = new Hono()
  .post("/tasks", authenticate, validateTaskCreation, createTask)
  .put("/tasks/:task_id", authenticate, validateTaskUpdate, updateTask)
  .patch("/tasks/:task_id/status", authenticate, validateTaskStatusUpdate, updateTaskStatus)
  .delete("/tasks/:task_id", authenticate, deleteTask)
  .get("/tasks/:task_id", authenticate, getTaskById)
  .get("/groups/:group_id/tasks", authenticate, getTasksByGroupId)
  .get("/my-tasks", authenticate, getTasksByUserId)
  .get("/tasks", authenticate, requireAdmin, getAllTasks);

export default taskRoutes;