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
    console.log('WARNING: Using deprecated fileUploadMiddleware. Update to use direct file handling.');
    
    // Parse multipart form data
    const formData = await c.req.formData();
    console.log('File upload middleware parsed formData:', Array.from(formData.keys()));
    
    // Get the file object
    const file = formData.get('file') as File | null;
    
    // Get other form values and store in context
    const formValues: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'file') {
        formValues[key] = value;
      }
    }
    c.set('formValues', formValues);

    // If file is not present, continue without processing file
    if (!file) {
      console.log('No file in request, continuing to next middleware');
      await next();
      return;
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
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Store file in context for the controller
    c.set("file", file);

    await next();
  } catch (error) {
    console.error('Error in file upload middleware:', error);
    throw error;
  }
};
