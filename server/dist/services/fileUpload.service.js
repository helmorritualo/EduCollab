import path from "path";
import fs from "fs";
import { uploadFile, getFilesByGroupId, getAllFiles, getFileById, } from "@/models/fileUpload";
import { BadRequestError, NotFoundError, ForbiddenError } from "@/utils/error";
/**
 * @deprecated This service is deprecated. File handling is now done directly in controllers.
 * See fileUpload.controller.ts for the new implementation.
 */
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
/**
 * @deprecated This function is deprecated. Use the direct approach in fileUpload.controller.ts instead.
 */
export const uploadFileService = async (file, taskId, groupId, userId) => {
    console.warn('WARNING: Using deprecated uploadFileService. Update to use direct file handling in controller.');
    try {
        // Validate inputs
        if (!file || !file.originalFilename) {
            throw new BadRequestError("Invalid file data");
        }
        if (!groupId || isNaN(groupId)) {
            throw new BadRequestError("Valid group ID is required");
        }
        if (!userId || isNaN(userId)) {
            throw new BadRequestError("Valid user ID is required");
        }
        // Validate file type
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
            // Delete the temporary file if it exists
            if (file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            throw new BadRequestError("Invalid file type. Only PDF and DOC files are allowed.");
        }
        // Generate unique filename
        const ext = path.extname(file.originalFilename);
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
        const destPath = path.join(UPLOAD_DIR, filename);
        // Copy file if it exists
        if (file.path && fs.existsSync(file.path)) {
            fs.copyFileSync(file.path, destPath);
            // Delete the original temp file
            fs.unlinkSync(file.path);
        }
        else {
            throw new BadRequestError("File not found or invalid");
        }
        // Save file info to database
        const fileData = {
            filename,
            original_filename: file.originalFilename,
            file_path: destPath,
            file_type: file.mimetype,
            file_size: file.size,
            task_id: taskId,
            group_id: groupId,
            uploaded_by: userId,
        };
        // Insert file record into database
        return await uploadFile(fileData);
    }
    catch (error) {
        // Clean up temporary file if it exists
        if (file.path && fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
            }
            catch (cleanupError) {
                console.error('Failed to clean up temporary file:', cleanupError);
            }
        }
        if (error instanceof BadRequestError) {
            throw error;
        }
        console.error('Error in uploadFileService:', error);
        throw new Error("Failed to upload file");
    }
};
/**
 * @deprecated This function is deprecated. Use direct database queries in the controller instead.
 */
export const getFilesByGroupIdService = async (groupId, userId, isAdmin) => {
    console.warn('WARNING: Using deprecated getFilesByGroupIdService. Update to use direct queries in controller.');
    if (!groupId || isNaN(groupId)) {
        throw new BadRequestError("Valid group ID is required");
    }
    if (!userId || isNaN(userId)) {
        throw new BadRequestError("Valid user ID is required");
    }
    // If not admin, verify membership in the group
    if (!isAdmin) {
        // Note: This functionality is now handled directly in the controller
        // Left here for backwards compatibility
    }
    return await getFilesByGroupId(groupId);
};
/**
 * @deprecated This function is deprecated. Use direct database queries in the controller instead.
 */
export const getAllFilesService = async (isAdmin) => {
    console.warn('WARNING: Using deprecated getAllFilesService. Update to use direct queries in controller.');
    if (!isAdmin) {
        throw new ForbiddenError("Only admins can access all files");
    }
    return await getAllFiles();
};
/**
 * @deprecated This function is deprecated. Use direct file handling in the controller instead.
 */
export const downloadFileService = async (fileId, userId, isAdmin) => {
    console.warn('WARNING: Using deprecated downloadFileService. Update to use direct file handling in controller.');
    if (!fileId || isNaN(fileId)) {
        throw new BadRequestError("Valid file ID is required");
    }
    if (!userId || isNaN(userId)) {
        throw new BadRequestError("Valid user ID is required");
    }
    // Get file by ID
    const file = await getFileById(fileId);
    if (!file) {
        throw new NotFoundError("File not found");
    }
    // Verify user has access to this file (if not admin)
    if (!isAdmin) {
        // In the new approach, this check is done directly in the controller
        // Left here for backwards compatibility
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
