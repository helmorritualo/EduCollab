import path from "path";
import fs from "fs";
import { FileUpload, FileUploadWithDetails } from "@/types";
import {
  uploadFile,
  getFilesByGroupId,
  getAllFiles,
  getFileById,
} from "@/models/fileUpload";
import { BadRequestError, NotFoundError, ForbiddenError } from "@/utils/error";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const uploadFileService = async (
  file: {
    originalFilename: string;
    mimetype: string;
    size: number;
    path: string;
  },
  taskId: number | null,
  groupId: number,
  userId: number
): Promise<number> => {
  try {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      // Delete the temporary file
      fs.unlinkSync(file.path);
      throw new BadRequestError(
        "Invalid file type. Only PDF and DOC files are allowed."
      );
    }

    // Generate unique filename
    const ext = path.extname(file.originalFilename);
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}${ext}`;
    const destPath = path.join(UPLOAD_DIR, filename);

    // Move file to uploads directory
    fs.renameSync(file.path, destPath);

    // Save file info to database
    const fileData: FileUpload = {
      filename,
      original_filename: file.originalFilename,
      file_path: destPath,
      file_type: file.mimetype,
      file_size: file.size,
      task_id: taskId,
      group_id: groupId,
      uploaded_by: userId,
    };

    return await uploadFile(fileData);
  } catch (error) {
    // Clean up temporary file if it exists
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
};

export const getFilesByGroupIdService = async (
  groupId: number,
  userId: number,
  isAdmin: boolean
): Promise<FileUploadWithDetails[]> => {
  return await getFilesByGroupId(groupId);
};

export const getAllFilesService = async (
  isAdmin: boolean
): Promise<FileUploadWithDetails[]> => {
  if (!isAdmin) {
    throw new ForbiddenError("Only admins can access all files");
  }
  return await getAllFiles();
};

export const downloadFileService = async (
  fileId: number,
  userId: number,
  isAdmin: boolean
): Promise<{ filePath: string; filename: string }> => {
  const file = await getFileById(fileId);
  if (!file) {
    throw new NotFoundError("File not found");
  }

  // Verify file exists on disk
  if (!fs.existsSync(file.file_path)) {
    throw new NotFoundError("File not found on server");
  }

  return {
    filePath: file.file_path,
    filename: file.original_filename,
  };
};
