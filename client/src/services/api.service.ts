import axios, { AxiosResponse } from "axios";
import { validateResponse } from "@/helpers/validate-response";
import {
  Group,
  GroupWithMembers,
  TeacherInvitation,
  FileUpload,
  TaskWithDetails,
} from "@/types";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  groups?: T extends Array<unknown> ? T : never;
  group?: T extends object ? T : never;
  data?: T;
  files?: FileUpload[];
  file_id?: number;
  invitations?: T extends { invitations: TeacherInvitation[] }
    ? TeacherInvitation[]
    : never;
  invitation?: T extends { invitation: TeacherInvitation }
    ? TeacherInvitation
    : never;
  task_id?: number;
  task?: T extends { task: TaskWithDetails } ? TaskWithDetails : never;
  tasks?: T extends { tasks: TaskWithDetails[] } ? TaskWithDetails[] : never;
}

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding the token to the headers for all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    // Ensure headers object exists
    config.headers = config.headers || {};
    
    if (token) {
      // Always set Authorization header regardless of content type
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle Content-Type for different request types
    if (config.data instanceof FormData) {
      // For FormData, let the browser set the Content-Type with boundary
      delete config.headers["Content-Type"];
      
      // Make sure Authorization header is preserved for FormData
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // For JSON data
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global response validation and error handling and token refresh
api.interceptors.response.use(
  (
    response: AxiosResponse<{ success: boolean; error?: string }, unknown>
  ): Promise<AxiosResponse<{ success: boolean; error?: string }, unknown>> => {
    // Validate the response structure and throw if invalid
    validateResponse(response);
    return Promise.resolve(response);
  },
  async (error) => {
    let errorMessage = "An unexpected error occurred";
    const originalRequest = error.config;

    // If token expired or unauthorized, try to refresh
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // Add a small delay before attempting token refresh
      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        const token = localStorage.getItem("token");
        if (token) {
          // Call refresh token endpoint
          const refreshResponse = await api.post(
            "/api/refresh-token",
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const newToken = refreshResponse.data.token;
          if (newToken) {
            localStorage.setItem("token", newToken);
            // Update Authorization header and retry original request
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, clear token and redirect to login
        localStorage.removeItem("token");
        window.location.href = "/login";

        console.error("Refresh token failed:", refreshError);
        return Promise.reject(
          new Error("Session expired. Please log in again.")
        );
      }
    }

    // Extract error details from response
    const responseData = error.response?.data;

    if (responseData?.name && responseData?.message) {
      errorMessage = `${responseData.name}: ${responseData.message}`;
    } else if (responseData?.error) {
      errorMessage =
        typeof responseData.error === "string"
          ? responseData.error
          : JSON.stringify(responseData.error);
    } else if (error.message) {
      errorMessage = error.message;
    }
    return Promise.reject(new Error(errorMessage));
  }
);

export const profileAPI = {
  getUserProfile: async () => {
    const response = await api.get(`/api/profile`);
    return response.data;
  },
  updateUserProfile: async (data: {
    username?: string;
    email?: string;
    full_name?: string;
    phone_number?: string;
    gender?: string;
  }) => {
    const response = await api.put(`/api/profile`, data);
    return response.data;
  },
};

export const userAPI = {
  changePassword: async (data: {
    oldPassword: string;
    newPassword: string;
  }) => {
    const response = await api.put(`/api/user/change-password`, data);
    return response.data;
  },
  getAllUsers: async () => {
    const response = await api.get(`/api/users`);
    return response.data;
  },
  activateUser: async (userId: number) => {
    const response = await api.put(`/api/user/activate/${userId}`);
    return response.data;
  },
  deactivateUser: async (userId: number) => {
    const response = await api.put(`/api/user/deactivate/${userId}`);
    return response.data;
  },
};

export const groupAPI = {
  getAllGroups: async (): Promise<Group[]> => {
    const response = await api.get<ApiResponse<Group[]>>("/api/groups");
    return response.data.groups || [];
  },

  getGroupById: async (groupId: number): Promise<Group> => {
    const response = await api.get<ApiResponse<Group>>(
      `/api/groups/${groupId}`
    );
    if (!response.data.group) throw new Error("Group not found");
    return response.data.group;
  },

  createGroup: async (data: {
    name: string;
    description: string;
  }): Promise<Group> => {
    const response = await api.post<ApiResponse<Group>>("/api/groups", data);
    if (!response.data.group) throw new Error("Failed to create group");
    return response.data.group;
  },

  updateGroup: async (
    groupId: number,
    data: { name?: string; description?: string }
  ): Promise<Group> => {
    const response = await api.put<ApiResponse<Group>>(
      `/api/groups/${groupId}`,
      data
    );
    if (!response.data.group) throw new Error("Failed to update group");
    return response.data.group;
  },

  deleteGroup: async (groupId: number): Promise<boolean> => {
    const response = await api.delete<ApiResponse<void>>(
      `/api/groups/${groupId}`
    );
    return response.data.success;
  },

  joinGroup: async (data: { group_code: string }): Promise<boolean> => {
    const response = await api.post<ApiResponse<void>>(
      "/api/groups/join",
      data
    );
    return response.data.success;
  },

  leaveGroup: async (groupId: number): Promise<boolean> => {
    const response = await api.delete<ApiResponse<void>>(
      `/api/groups/${groupId}/leave`
    );
    return response.data.success;
  },

  listUserGroups: async (): Promise<Group[]> => {
    const response = await api.get<ApiResponse<Group[]>>("/api/user/groups");
    return response.data.groups || [];
  },

  getGroupDetails: async (groupId: number): Promise<GroupWithMembers> => {
    const response = await api.get<ApiResponse<GroupWithMembers>>(
      `/api/groups/${groupId}/details`
    );
    if (!response.data.group) throw new Error("Group not found");
    return response.data.group;
  },

  createTeacherGroupInvitation: async (data: {
    group_name: string;
    invited_teacher_name: string;
    project_details: string;
  }): Promise<TeacherInvitation> => {
    try {
      const response = await api.post<
        ApiResponse<{ invitation: TeacherInvitation }>
      >("/api/teacher-group-invitations", data);
      if (!response.data.invitation)
        throw new Error("Failed to create invitation");
      return response.data.invitation;
    } catch (error) {
      // Re-throw the error with the server's error message if available
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to create invitation");
    }
  },

  getInvitationsForTeacher: async (): Promise<TeacherInvitation[]> => {
    try {
      const response = await api.get<
        ApiResponse<{ invitations: TeacherInvitation[] }>
      >("/api/teacher-group-invitations");
      return response.data.invitations || [];
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "No invitations found for the teacher"
      ) {
        return [];
      }
      throw error;
    }
  },

  respondToInvitation: async (
    invitationId: number,
    data: { status: "approved" | "rejected" }
  ): Promise<boolean> => {
    try {
      const response = await api.patch<ApiResponse<void>>(
        `/api/teacher-group-invitations/${invitationId}`,
        data
      );
      return response.data.success;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to respond to invitation");
    }
  },
};

export const fileAPI = {
  uploadFile: async (
    file: File | null,
    groupId: number,
    taskId?: number
  ): Promise<number | null> => {
    try {
      // If no file provided, return null early
      if (!file) {
        console.log('No file provided for upload');
        return null;
      }

      // Validate file before uploading
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB limit
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (file.size > maxSizeInBytes) {
        throw new Error(`File size exceeds limit of 5MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      }
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}. Only PDF and Word documents are allowed.`);
      }

      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("groupId", groupId.toString());
      if (taskId !== undefined) {
        formData.append("taskId", taskId.toString());
      }

      console.log(`Uploading file: ${file.name}, size: ${(file.size / 1024).toFixed(2)}KB, type: ${file.type}`);
      
      // Use the pre-configured API instance which handles auth headers automatically
      const response = await api.post<ApiResponse<{file_id: number}>>("/api/files", formData, {
        // Let the browser set the content type with proper boundary
        headers: {
          'Content-Type': 'multipart/form-data' // Updated to explicitly set content type
        },
        // Track upload progress (helpful for larger files)
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || file.size));
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });

      // Check response
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to upload file");
      }

      console.log('File upload successful with ID:', response.data.file_id);
      return response.data.file_id ?? null;
    } catch (error) {
      console.error('File upload error:', error);
      if (error instanceof Error) {
        throw new Error(`File upload failed: ${error.message}`);
      }
      throw new Error("Failed to upload file");
    }
  },

  getGroupFiles: async (groupId: number): Promise<FileUpload[]> => {
    const response = await api.get<ApiResponse<void>>(
      `/api/files/group/${groupId}`
    );
    return response.data.files || [];
  },

  getTaskFiles: async (taskId: number): Promise<FileUpload[]> => {
    const response = await api.get<ApiResponse<void>>(`/api/files/task/${taskId}`);
    return response.data.files || [];
  },

  getAllFiles: async (): Promise<FileUpload[]> => {
    const response = await api.get<ApiResponse<void>>("/api/files/all");
    return response.data.files || [];
  },

  downloadFile: async (fileId: number): Promise<void> => {
    try {
      console.log(`Downloading file with ID: ${fileId}`);
      
      const response = await api.get(`/api/files/${fileId}/download`, {
        responseType: "blob",
      });

      // Get the content type from the response
      const contentType = response.headers["content-type"] || "application/octet-stream";
      console.log(`Content-Type from server: ${contentType}`);

      // Create a blob with the correct content type
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers["content-disposition"];
      let filename = `file-${fileId}`;
      
      if (contentDisposition) {
        // Parse the content-disposition header properly
        const filenameMatch = contentDisposition.match(/filename="(.+?)"/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
          console.log(`Extracted filename: ${filename}`);
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Failed to download file. Please try again.');
    }
  },

  // Use this new method name for clarity and consistency
  downloadTaskFile: async (fileId: number): Promise<void> => {
    try {
      console.log(`Downloading task file with ID: ${fileId}`);
      
      // First attempt to get file info to retrieve original_filename
      let originalFilename = '';
      try {
        // Get file details first - this is the most reliable way to get the original filename
        const filesResponse = await api.get(`/api/files/${fileId}`);
        if (filesResponse?.data?.data?.original_filename) {
          originalFilename = filesResponse.data.data.original_filename;
          console.log(`Got original filename from file data: ${originalFilename}`);
        }
      } catch (fileInfoError) {
        console.warn('Could not retrieve file info, will fall back to content-disposition header', fileInfoError);
      }

      // Call directly to the API instead of creating a circular reference
      const response = await api.get(`/api/files/${fileId}/download`, {
        responseType: "blob",
      });

      // Get the content type from the response
      const contentType = response.headers["content-type"] || "application/octet-stream";
      console.log(`Content-Type from server: ${contentType}`);

      // Create a blob with the correct content type
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement("a");
      link.href = url;

      // Use the original filename if we already have it, otherwise try to extract it from headers
      let filename = originalFilename || `file-${fileId}`;
      
      // Extract filename from Content-Disposition header if we didn't get it from file info
      if (!originalFilename) {
        const contentDisposition = response.headers["content-disposition"];
        if (contentDisposition) {
          // Parse the content-disposition header properly
          const filenameMatch = contentDisposition.match(/filename="(.+?)"/i);
          if (filenameMatch && filenameMatch[1]) {
            const headerFilename = decodeURIComponent(filenameMatch[1]);
            // Only use the header filename if it's not the generic 'file.pdf'
            if (headerFilename && headerFilename !== 'file.pdf') {
              filename = headerFilename;
            }
            console.log(`Extracted filename from header: ${headerFilename}`);
          }
        }
      }

      console.log(`Using filename for download: ${filename}`);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading task file:', error);
      throw new Error('Failed to download file. Please try again.');
    }
  }
};

export const taskAPI = {
  getTaskById: async (taskId: number): Promise<TaskWithDetails> => {
    try {
      const response = await api.get<ApiResponse<{ task: TaskWithDetails }>>(`/api/tasks/${taskId}`);
      
      if (!response.data.success || !response.data.task) {
        throw new Error(response.data.message || 'Failed to fetch task details');
      }
      
      return response.data.task;
    } catch (error) {
      console.error('Error fetching task details:', error);
      throw error;
    }
  },

  createTask: async (data: {
    title: string;
    description: string;
    due_date: string;
    group_id: number;
  }): Promise<number> => {
    try {
      // Verify we have all required data before proceeding
      if (!data.title || !data.description || !data.due_date || !data.group_id) {
        console.error('Missing required fields in task data:', data);
        throw new Error('All fields are required: title, description, due_date, and group_id');
      }
      
      console.log('Task creation input data:', data);
      
      // Create a clean object with only the required properties and proper types
      const taskData = {
        title: data.title.trim(),
        description: data.description.trim(),
        due_date: data.due_date,
        group_id: Number(data.group_id), // Ensure it's a number
        status: "pending" // Set status to pending by default
      };

      console.log('Sending task data:', JSON.stringify(taskData));

      // Use the axios instance instead of fetch to maintain consistency
      const response = await api.post<ApiResponse<{ task_id: number }>>(
        "/api/tasks",
        taskData
      );

      console.log('Task creation response:', response.data);
      
      if (!response.data.success) {
        console.error('Server error response:', response.data);
        throw new Error(response.data.message || "Failed to create task");
      }

      if (!response.data.task_id) {
        throw new Error("Failed to create task: No task ID returned");
      }

      return response.data.task_id;
    } catch (error) {
      console.error('Task creation error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to create task");
    }
  },

  uploadTaskFiles: async (taskId: number, files: File[], groupId: number): Promise<boolean> => {
    try {
      // If no files, return success immediately
      if (files.length === 0) return true;
      
      console.log(`Starting upload of ${files.length} files for task ${taskId} in group ${groupId}`);
      
      // Upload files one by one to ensure each upload succeeds
      const uploadPromises = files.map(file => 
        fileAPI.uploadFile(file, groupId, taskId)
          .catch(error => {
            console.error(`Error uploading file ${file.name}:`, error);
            throw error; // Re-throw to be caught by Promise.all
          })
      );
      
      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
      
      console.log(`Successfully uploaded ${files.length} files for task ${taskId}`);
      return true;
    } catch (error) {
      console.error('Task files upload error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to upload task files: ${error.message}`);
      }
      throw new Error("Failed to upload task files");
    }
  },

  updateTask: async (
    taskId: number,
    data: {
      title: string;
      description: string;
      status: string;
      due_date: string;
      group_id: number;
      assigned_to?: number;
    }
  ): Promise<boolean> => {
    try {
      // Verify we have all required data before proceeding
      if (!data.title || !data.description || !data.status || !data.due_date || !data.group_id) {
        throw new Error('All fields are required: title, description, status, due_date, and group_id');
      }
      
      // Create a clean task data object with proper types
      const taskData = {
        title: data.title.trim(),
        description: data.description.trim(),
        status: data.status,
        due_date: data.due_date,
        group_id: Number(data.group_id),
        assigned_to: data.assigned_to
      };

      // Update the task using JSON
      const response = await api.put<ApiResponse<{ success: boolean }>>(
        `/api/tasks/${taskId}`,
        taskData
      );
      
      if (!response.data.success) {
        throw new Error("Failed to update task");
      }

      return response.data.success === true;
    } catch (error) {
      console.error('Task update error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to update task");
    }
  },

  updateTaskStatus: async (
    taskId: number,
    status: string
  ): Promise<boolean> => {
    try {
      const response = await api.patch<ApiResponse<{ success: boolean }>>(
        `/api/tasks/${taskId}/status`,
        { status }
      );

      if (!response.data.success) {
        throw new Error("Failed to update task status");
      }

      return response.data.success === true;
    } catch (error) {
      console.error('Task status update error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to update task status");
    }
  },

  deleteTask: async (taskId: number): Promise<boolean> => {
    const response = await api.delete<ApiResponse<void>>(
      `/api/tasks/${taskId}`
    );
    return response.data.success;
  },

  getTasksByGroupId: async (groupId: number) => {
    const response = await api.get<ApiResponse<{ tasks: TaskWithDetails[] }>>(
      `/api/groups/${groupId}/tasks`
    );
    return response.data.tasks || [];
  },

  getMyTasks: async () => {
    const response = await api.get<ApiResponse<{ tasks: TaskWithDetails[] }>>(
      "/api/tasks/my-tasks"
    );
    return response.data.tasks || [];
  },

  getAllTasks: async () => {
    const response = await api.get<ApiResponse<{ tasks: TaskWithDetails[] }>>(
      "/api/tasks"
    );
    return response.data.tasks || [];
  },

  downloadTaskFile: async (fileId: number): Promise<void> => {
    return fileAPI.downloadFile(fileId);
  }
};
