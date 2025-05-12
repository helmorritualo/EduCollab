import { Hono } from "hono";
import {
  uploadFile,
  getFilesByGroup,
  getAllFiles,
  downloadFile,
  getFilesByTask,
} from "./fileUpload.controller";
import { requireAdmin, authenticate } from "@/middlewares/authentication";

// Create a new Hono app for file upload routes
const fileUploadRoutes = new Hono();

fileUploadRoutes.post("/files", authenticate, uploadFile);

// Other file routes
fileUploadRoutes.get("/files/group/:groupId", authenticate, getFilesByGroup);
fileUploadRoutes.get("/files/task/:taskId", authenticate, getFilesByTask);
fileUploadRoutes.get("/files/all", authenticate, requireAdmin, getAllFiles);
fileUploadRoutes.get("/files/:fileId/download", authenticate, downloadFile);

export default fileUploadRoutes;
