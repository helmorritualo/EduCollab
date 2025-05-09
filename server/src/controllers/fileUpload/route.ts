import { Hono } from "hono";
import {
  uploadFile,
  getFilesByGroup,
  getAllFiles,
  downloadFile,
} from "./fileUpload.controller";
import { requireAdmin, authenticate } from "@/middlewares/authentication";
import { fileUploadMiddleware } from "@/middlewares/file-upload";

const fileUploadRoutes = new Hono()
  // File upload routes
  .post("/files", authenticate, fileUploadMiddleware, uploadFile)
  .get("/files/group/:groupId", authenticate, getFilesByGroup)
  .get("/files/all", authenticate, requireAdmin, getAllFiles)
  .get("/files/:fileId/download", authenticate, downloadFile);

export default fileUploadRoutes;
