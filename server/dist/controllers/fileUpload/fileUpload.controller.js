import * as fs from "fs";
import * as path from "path";
import conn from "@/config/database";
import { BadRequestError, InternalServerError } from "@/utils/error";
// Define constants
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
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
 * Upload a file
 * This controller handles multipart form data directly using Hono's built-in parsing
 */
export const uploadFile = async (c) => {
    try {
        // Get authenticated user ID from context
        const userId = c.get("user_id");
        if (!userId) {
            throw new BadRequestError("User authentication required");
        }
        // Parse the multipart form data
        const formData = await c.req.formData();
        console.log("Form data received with fields:", Array.from(formData.keys()));
        // Get groupId and taskId from form data
        const groupIdValue = formData.get("groupId");
        if (!groupIdValue) {
            console.error("Missing groupId in form data");
            throw new BadRequestError("groupId is required");
        }
        const groupId = parseInt(groupIdValue.toString());
        if (isNaN(groupId)) {
            console.error("Invalid groupId format:", groupIdValue);
            throw new BadRequestError("groupId must be a valid number");
        }
        // Get taskId (optional)
        const taskIdValue = formData.get("taskId");
        const taskId = taskIdValue ? parseInt(taskIdValue.toString()) : null;
        if (taskIdValue && isNaN(parseInt(taskIdValue.toString()))) {
            console.error("Invalid taskId format:", taskIdValue);
            throw new BadRequestError("taskId must be a valid number");
        }
        // Get the uploaded file
        const file = formData.get("file");
        // If no file provided, return error for clarity
        if (!file) {
            console.error("No file found in the form data");
            throw new BadRequestError("No file provided for upload");
        }
        console.log("File information:", {
            name: file.name,
            type: file.type,
            size: file.size
        });
        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            console.error("Invalid file type:", file.type);
            throw new BadRequestError(`Invalid file type: ${file.type}. Only PDF and DOC files are allowed.`);
        }
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            console.error("File size too large:", file.size);
            throw new BadRequestError(`File size exceeds 5MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        }
        // Generate a unique filename
        const originalFilename = file.name;
        const fileExt = path.extname(originalFilename);
        const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExt}`;
        const filePath = path.join(UPLOAD_DIR, uniqueFilename);
        // Write the file to disk
        try {
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(filePath, fileBuffer);
            console.log("File written to disk successfully at:", filePath);
        }
        catch (writeError) {
            console.error("Error writing file to disk:", writeError);
            throw new InternalServerError("Failed to save file to server. Please try again.");
        }
        // Insert file record into database
        const sql = `
      INSERT INTO files
      (filename, original_filename, file_path, file_type, file_size, task_id, group_id, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
        try {
            const [result] = await conn.execute(sql, [
                uniqueFilename,
                originalFilename,
                filePath,
                file.type,
                file.size,
                taskId,
                groupId,
                userId
            ]);
            const fileId = result.insertId;
            console.log("File record inserted into database with ID:", fileId);
            // Return success response
            return c.json({
                success: true,
                message: "File uploaded successfully",
                file_id: fileId,
                file_name: originalFilename
            }, 201);
        }
        catch (dbError) {
            console.error("Database error during file upload:", dbError);
            // If database insert fails, remove the file from disk
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                    console.log("Cleaned up file at path:", filePath);
                }
                catch (cleanupError) {
                    console.error("Failed to clean up file after DB error:", cleanupError);
                }
            }
            throw new InternalServerError("Failed to record file upload in database. Please try again.");
        }
    }
    catch (error) {
        console.error("Error uploading file:", error);
        if (error instanceof BadRequestError) {
            return c.json({
                success: false,
                message: error.message
            }, 400);
        }
        if (error instanceof InternalServerError) {
            return c.json({
                success: false,
                message: error.message
            }, 500);
        }
        return c.json({
            success: false,
            message: "Failed to upload file. Please try again."
        }, 500);
    }
};
/**
 * Get files by group ID
 */
export const getFilesByGroup = async (c) => {
    try {
        const groupId = parseInt(c.req.param("groupId"));
        if (isNaN(groupId)) {
            throw new BadRequestError("Invalid group ID");
        }
        const userId = c.get("user_id");
        const userRole = c.get("user_role");
        const isAdmin = userRole === "admin";
        // SQL query to get files with user and group info
        let sql = `
      SELECT
        f.*,
        u.username,
        u.full_name,
        g.name as group_name
      FROM files f
      JOIN users u ON f.uploaded_by = u.user_id
      JOIN groups g ON f.group_id = g.group_id
      WHERE f.group_id = ?
    `;
        // If not admin, only show files from groups they're a member of
        if (!isAdmin) {
            sql += ` AND EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = f.group_id AND gm.user_id = ?
      )`;
        }
        sql += ` ORDER BY f.uploaded_at DESC`;
        // Execute the query
        const params = isAdmin ? [groupId] : [groupId, userId];
        const [rows] = await conn.execute(sql, params);
        // Format the response
        const files = rows.map(row => ({
            file_id: row.file_id,
            filename: row.filename,
            original_filename: row.original_filename,
            file_type: row.file_type,
            file_size: row.file_size,
            task_id: row.task_id,
            group_id: row.group_id,
            uploaded_by: row.uploaded_by,
            uploaded_at: row.uploaded_at,
            uploader: {
                username: row.username,
                full_name: row.full_name,
            },
            group: {
                name: row.group_name,
            },
        }));
        return c.json({
            success: true,
            files,
        });
    }
    catch (error) {
        console.error("Error getting files by group:", error);
        if (error instanceof BadRequestError) {
            throw error;
        }
        throw new InternalServerError("Failed to get files. Please try again.");
    }
};
/**
 * Get all files (admin only)
 */
export const getAllFiles = async (c) => {
    try {
        const userRole = c.get("user_role");
        // Only admins can access all files
        if (userRole !== "admin") {
            throw new BadRequestError("Admin access required");
        }
        // SQL query to get all files with user and group info
        const sql = `
      SELECT
        f.*,
        u.username,
        u.full_name,
        g.name as group_name
      FROM files f
      JOIN users u ON f.uploaded_by = u.user_id
      JOIN groups g ON f.group_id = g.group_id
      ORDER BY f.uploaded_at DESC
    `;
        // Execute the query
        const [rows] = await conn.execute(sql);
        // Format the response
        const files = rows.map(row => ({
            file_id: row.file_id,
            filename: row.filename,
            original_filename: row.original_filename,
            file_type: row.file_type,
            file_size: row.file_size,
            task_id: row.task_id,
            group_id: row.group_id,
            uploaded_by: row.uploaded_by,
            uploaded_at: row.uploaded_at,
            uploader: {
                username: row.username,
                full_name: row.full_name,
            },
            group: {
                name: row.group_name,
            },
        }));
        return c.json({
            success: true,
            files,
        });
    }
    catch (error) {
        console.error("Error getting all files:", error);
        if (error instanceof BadRequestError) {
            throw error;
        }
        throw new InternalServerError("Failed to get files. Please try again.");
    }
};
/**
 * Get files by task ID
 */
export const getFilesByTask = async (c) => {
    try {
        const taskId = parseInt(c.req.param("taskId"));
        if (isNaN(taskId)) {
            throw new BadRequestError("Invalid task ID");
        }
        const userId = c.get("user_id");
        const userRole = c.get("user_role");
        const isAdmin = userRole === "admin";
        // SQL query to get files with user and group info
        let sql = `
      SELECT
        f.*,
        u.username,
        u.full_name,
        g.name as group_name
      FROM files f
      JOIN users u ON f.uploaded_by = u.user_id
      JOIN groups g ON f.group_id = g.group_id
      WHERE f.task_id = ?
    `;
        // If not admin, only show files from groups they're a member of
        if (!isAdmin) {
            sql += ` AND EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = f.group_id AND gm.user_id = ?
      )`;
        }
        sql += ` ORDER BY f.uploaded_at DESC`;
        // Execute the query
        const params = isAdmin ? [taskId] : [taskId, userId];
        const [rows] = await conn.execute(sql, params);
        // Format the response
        const files = rows.map(row => ({
            file_id: row.file_id,
            filename: row.filename,
            original_filename: row.original_filename,
            file_type: row.file_type,
            file_size: row.file_size,
            task_id: row.task_id,
            group_id: row.group_id,
            uploaded_by: row.uploaded_by,
            uploaded_at: row.uploaded_at,
            uploader: {
                username: row.username,
                full_name: row.full_name,
            },
            group: {
                name: row.group_name,
            },
        }));
        return c.json({
            success: true,
            files,
        });
    }
    catch (error) {
        console.error("Error getting files by task:", error);
        if (error instanceof BadRequestError) {
            throw error;
        }
        throw new InternalServerError("Failed to get task files. Please try again.");
    }
};
/**
 * Download a file
 */
export const downloadFile = async (c) => {
    try {
        const fileId = parseInt(c.req.param("fileId"));
        if (isNaN(fileId)) {
            throw new BadRequestError("Invalid file ID");
        }
        console.log(`Processing download request for file ID: ${fileId}`);
        const userId = c.get("user_id");
        const userRole = c.get("user_role");
        const isAdmin = userRole === "admin";
        // SQL query to get file info
        let sql = `SELECT * FROM files WHERE file_id = ?`;
        // If not admin, only allow downloading files from groups they're a member of
        if (!isAdmin) {
            sql = `
        SELECT f.* FROM files f
        WHERE f.file_id = ?
        AND EXISTS (
          SELECT 1 FROM group_members gm
          WHERE gm.group_id = f.group_id AND gm.user_id = ?
        )
      `;
        }
        // Execute the query
        const params = isAdmin ? [fileId] : [fileId, userId];
        const [rows] = await conn.execute(sql, params);
        if (!rows.length) {
            console.error(`File not found or permission denied for file ID: ${fileId}, user ID: ${userId}`);
            throw new BadRequestError("File not found or you don't have permission to access it");
        }
        const file = rows[0];
        const filePath = file.file_path;
        console.log(`Found file record:`, {
            id: file.file_id,
            name: file.original_filename,
            type: file.file_type,
            path: file.file_path
        });
        // Check if file exists on disk
        if (!fs.existsSync(filePath)) {
            console.error(`File not found on disk at path: ${filePath}`);
            throw new InternalServerError("File not found on server");
        }
        // Read the file
        const fileBuffer = fs.readFileSync(filePath);
        console.log(`Successfully read file from disk, size: ${fileBuffer.length} bytes`);
        // Determine correct MIME type
        let contentType = file.file_type;
        // Fallback to determining type by extension if stored type is missing/generic
        if (!contentType || contentType === "application/octet-stream") {
            const ext = path.extname(file.original_filename).toLowerCase();
            switch (ext) {
                case ".pdf":
                    contentType = "application/pdf";
                    break;
                case ".doc":
                    contentType = "application/msword";
                    break;
                case ".docx":
                    contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    break;
                default:
                    contentType = "application/octet-stream";
            }
        }
        console.log(`Setting content type for download: ${contentType}`);
        // Set headers for file download - ensure encoding is correct for binary data
        c.header("Content-Disposition", `attachment; filename="${encodeURIComponent(file.original_filename)}"`);
        c.header("Content-Type", contentType);
        c.header("Content-Length", fileBuffer.length.toString());
        c.header("Cache-Control", "no-cache");
        // Return the file as binary buffer
        return c.body(fileBuffer);
    }
    catch (error) {
        console.error("Error downloading file:", error);
        if (error instanceof BadRequestError) {
            return c.json({
                success: false,
                message: error.message
            }, 400);
        }
        return c.json({
            success: false,
            message: "Failed to download file. Please try again."
        }, 500);
    }
};
