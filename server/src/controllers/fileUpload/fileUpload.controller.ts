import { Context } from "hono";
import {
  uploadFileService,
  getFilesByGroupIdService,
  getAllFilesService,
  downloadFileService,
} from "@/services/fileUpload.service";
import { BadRequestError } from "@/utils/error";

export const uploadFile = async (c: Context) => {
  const file = c.get("file");
  const taskId = c.req.query("taskId")
    ? parseInt(c.req.query("taskId")!)
    : null;
  const groupId = parseInt(c.req.query("groupId")!);
  const userId = c.get("user_id");

  if (!file || !groupId) {
    throw new BadRequestError("File and groupId are required");
  }

  const fileId = await uploadFileService(file, taskId, groupId, userId);

  return c.json(
    {
      success: true,
      message: "File uploaded successfully",
      file_id: fileId,
    },
    201
  );
};

export const getFilesByGroup = async (c: Context) => {
  const groupId = parseInt(c.req.param("groupId"));
  const userId = c.get("user_id");
  const isAdmin = c.get("user_role") === "admin";

  const files = await getFilesByGroupIdService(groupId, userId, isAdmin);

  return c.json({
    success: true,
    files,
  });
};

export const getAllFiles = async (c: Context) => {
  const isAdmin = c.get("user_role") === "admin";
  const files = await getAllFilesService(isAdmin);

  return c.json({
    success: true,
    files,
  });
};

export const downloadFile = async (c: Context) => {
  const fileId = parseInt(c.req.param("fileId"));
  const userId = c.get("user_id");
  const isAdmin = c.get("user_role") === "admin";

  const file = await downloadFileService(fileId, userId, isAdmin);

  // Set headers for file download
  c.header("Content-Disposition", `attachment; filename="${file.filename}"`);
  c.header("Content-Type", "application/octet-stream");

  // Return the file stream
  return c.body(file.filePath);
};
