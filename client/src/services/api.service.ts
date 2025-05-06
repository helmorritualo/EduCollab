import axios, { AxiosResponse } from "axios";
import { validateResponse } from "@/helpers/validate-response";
import { Group, GroupWithMembers, TeacherInvitation } from "@/types";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  groups?: T extends Array<unknown> ? T : never;
  group?: T extends object ? T : never;
  data?: T;
  invitations?: T extends { invitations: TeacherInvitation[] }
    ? TeacherInvitation[]
    : never;
  invitation?: T extends { invitation: TeacherInvitation }
    ? TeacherInvitation
    : never;
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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    } else {
      delete config.headers["Content-Type"];
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
