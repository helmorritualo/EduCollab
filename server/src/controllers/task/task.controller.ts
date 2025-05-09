import { Context } from "hono";
import {
  createTaskService,
  updateTaskService,
  updateTaskStatusService,
  deleteTaskService,
  getTaskByIdService,
  getTasksByGroupIdService,
  getTasksByUserIdService,
  getAllTasksService,
} from "@/services/task.service";
import { uploadFileService } from "@/services/fileUpload.service";
import { BadRequestError } from "@/utils/error";
import { GroupMember } from "@/types";
import { syncTaskStatusWithAssignment } from "@/models/task_assignment";

export const createTask = async (c: Context) => {
  const { title, description, status, due_date, group_id, assigned_to } =
    c.get("validatedTaskBody");
  const user_id = c.get("user_id");
  const groupMembers = c.get("groupMembers") as GroupMember[];
  const file = c.get("file") as any;

  // If assigned_to is provided, verify the user is a group member
  if (assigned_to) {
    const isGroupMember = groupMembers.some(
      (member: GroupMember) => member.user_id === assigned_to
    );
    if (!isGroupMember) {
      throw new BadRequestError("Assigned user must be a member of the group");
    }
  }

  let fileId = null;
  const taskId = await createTaskService({
    title,
    description,
    status,
    due_date,
    group_id,
    created_by: user_id,
    assigned_to: assigned_to || null,
  });

  if (file) {
    // Upload file if provided, now with the correct taskId
    fileId = await uploadFileService(
      {
        originalFilename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      },
      taskId,
      group_id,
      user_id
    );
  }

  return c.json(
    {
      success: true,
      message: "Task created successfully",
      task_id: taskId,
      file_id: fileId,
    },
    201
  );
};

export const updateTask = async (c: Context) => {
  const task_id = parseInt(c.req.param("task_id"));
  const { title, description, status, due_date, group_id, assigned_to } =
    c.get("validatedTaskBody");
  const user_id = c.get("user_id");
  const is_admin = c.get("user_role") === "admin";
  const file = c.get("file") as any;

  await updateTaskService(
    {
      task_id,
      title,
      description,
      status,
      due_date,
      group_id,
      created_by: user_id, // This won't be updated in the service
      assigned_to: assigned_to || null,
    },
    user_id,
    is_admin
  );

  let fileId = null;
  if (file) {
    // Upload file if provided, now with the correct task_id
    fileId = await uploadFileService(
      {
        originalFilename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      },
      task_id,
      group_id,
      user_id
    );
  }

  return c.json(
    {
      success: true,
      message: "Task updated successfully",
      file_id: fileId,
    },
    200
  );
};

export const updateTaskStatus = async (c: Context) => {
  const task_id = parseInt(c.req.param("task_id"));
  const { status } = c.get("validatedTaskStatusBody");
  const user_id = c.get("user_id");

  // Update the task status
  await updateTaskStatusService(task_id, status, user_id);

  // Also update the assignment status to keep them in sync
  await syncTaskStatusWithAssignment(task_id, user_id, status);

  return c.json(
    {
      success: true,
      message: "Task status updated successfully",
    },
    200
  );
};

export const deleteTask = async (c: Context) => {
  const task_id = parseInt(c.req.param("task_id"));
  const user_id = c.get("user_id");
  const is_admin = c.get("user_role") === "admin";

  await deleteTaskService(task_id, user_id, is_admin);

  return c.json(
    {
      success: true,
      message: "Task deleted successfully",
    },
    200
  );
};

export const getTaskById = async (c: Context) => {
  const task_id = parseInt(c.req.param("task_id"));
  const task = await getTaskByIdService(task_id);

  return c.json({
    success: true,
    task,
  });
};

export const getTasksByGroupId = async (c: Context) => {
  const group_id = parseInt(c.req.param("group_id"));
  const user_id = c.get("user_id");
  const tasks = await getTasksByGroupIdService(group_id, user_id);

  return c.json({
    success: true,
    tasks,
  });
};

export const getTasksByUserId = async (c: Context) => {
  const user_id = c.get("user_id");
  const tasks = await getTasksByUserIdService(user_id);

  return c.json({
    success: true,
    tasks: tasks || [],
  });
};

export const getAllTasks = async (c: Context) => {
  const tasks = await getAllTasksService();

  return c.json({
    success: true,
    tasks,
  });
};
