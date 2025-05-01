import axios, { AxiosResponse } from "axios";
import { validateResponse } from "@/helpers/validate-response";

const BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
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
    }
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
    }
};

export const groupAPI = {
    getAllGroups: async () => {
        const response = await api.get(`/api/groups`);
        return response.data;
    },
    getGroupById: async (groupId: number) => {
        const response = await api.get(`/api/groups/${groupId}`);
        return response.data;
    },
    createGroup: async (data: {
        name: string;
        description: string;
    }) => {
        const response = await api.post(`/api/groups`, data);
        return response.data;
    },
    updateGroup: async (groupId: number, data: {
        name?: string;
        description?: string;
    }) => {
        const response = await api.put(`/api/groups/${groupId}`, data);
        return response.data;
    },
    deleteGroup: async (groupId: number) => {
        const response = await api.delete(`/api/groups/${groupId}`);
        return response.data;
    },
    joinGroup: async () => {
        const response = await api.post(`/api/groups/join`);
        return response.data;
    },
    listUserGroups: async () => {
        const response = await api.get(`/api/user/groups`);
        return response.data;
    },
    getGroupDetails: async (groupId: number) => {
        const response = await api.get(`/api/groups/${groupId}/details`);
        return response.data;
    },
    getGroupsByTeacher: async () => {
        const response = await api.get(`/api/teachers/groups`);
        return response.data;
    },
    createTeacherGroupInvitation: async (data: {
        groupId: number;
        invited_teacher_id: number;
        project_details: string;
    }) => {
        const response = await api.post(`/api/teacher-group-invitations`, data);
        return response.data;
    },
    getInvitationsForTeacher: async () => {
        const response = await api.get(`/api/teacher-group-invitations`);
        return response.data;
    },
    respondToInvitation: async (invitationId: number, data: {
        response: string;
    }) => {
        const response = await api.patch(`/api/teacher-group-invitations/${invitationId}`, data);
        return response.data;
    }
};