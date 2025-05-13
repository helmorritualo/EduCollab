import conn from "@/config/database";
export const uploadFile = async (fileUpload) => {
    try {
        const sql = `
      INSERT INTO files
      (filename, original_filename, file_path, file_type, file_size, task_id, group_id, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const [result] = await conn.execute(sql, [
            fileUpload.filename,
            fileUpload.original_filename,
            fileUpload.file_path,
            fileUpload.file_type,
            fileUpload.file_size,
            fileUpload.task_id || null,
            fileUpload.group_id,
            fileUpload.uploaded_by,
        ]);
        return result.insertId;
    }
    catch (error) {
        console.error(`Error uploading file: ${error}`);
        throw error;
    }
};
export const getFilesByGroupId = async (groupId) => {
    try {
        const sql = `
      SELECT
        f.*,
        u.username,
        u.full_name,
        g.name as group_name
      FROM files f
      JOIN users u ON f.uploaded_by = u.user_id
      JOIN groups g ON f.group_id = g.group_id
      WHERE f.group_id = ?
      ORDER BY f.uploaded_at DESC
    `;
        const [rows] = await conn.execute(sql, [groupId]);
        return rows.map((row) => ({
            file_id: row.file_id,
            filename: row.filename,
            original_filename: row.original_filename,
            file_path: row.file_path,
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
    }
    catch (error) {
        console.error(`Error getting files by group: ${error}`);
        throw error;
    }
};
export const getAllFiles = async () => {
    try {
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
        const [rows] = await conn.execute(sql);
        return rows.map((row) => ({
            file_id: row.file_id,
            filename: row.filename,
            original_filename: row.original_filename,
            file_path: row.file_path,
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
    }
    catch (error) {
        console.error(`Error getting all files: ${error}`);
        throw error;
    }
};
export const getFileById = async (fileId) => {
    try {
        const sql = `SELECT * FROM files WHERE file_id = ?`;
        const [rows] = await conn.execute(sql, [fileId]);
        const files = rows;
        return files[0] || null;
    }
    catch (error) {
        console.error(`Error getting file: ${error}`);
        throw error;
    }
};
