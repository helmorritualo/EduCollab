import { Context, Next } from "hono";
import { BadRequestError } from "@/utils/error";
import * as fs from "fs";
import * as path from "path";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const fileUploadMiddleware = async (c: Context, next: Next) => {
  try {
    const body = await c.req.parseBody();
    const file = body.file as File;

    if (!file || !(file instanceof File)) {
      throw new BadRequestError("No file uploaded");
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new BadRequestError(
        "Invalid file type. Only PDF and DOC files are allowed."
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestError("File size exceeds 5MB limit");
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const tempFilename = `${Date.now()}-${file.name}`;
    const tempPath = path.join(uploadsDir, tempFilename);

    // Store file info in context for the controller
    c.set("file", {
      originalFilename: file.name,
      mimetype: file.type,
      size: file.size,
      path: tempPath,
    });

    await next();
  } catch (error) {
    throw error;
  }
};
