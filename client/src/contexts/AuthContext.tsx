import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { profileAPI } from "@/services/api.service";
import axios from "axios";
import { UserData, AuthContextType, User } from "@/types";
import Swal from "sweetalert2";

interface AuthProviderProps {
  children: ReactNode;
}

const defaultAuthContextValue: AuthContextType = {
  token: null,
  user: null,
  isLoading: true,
  login: async () => {
    throw new Error("Login function not implemented in default context");
  },
  register: async () => {
    throw new Error("Register function not implemented in default context");
  },
  logout: () => {
    throw new Error("Logout function not implemented in default context");
  },
  isAdmin: false,
  updateProfile: async () => {
    throw new Error(
      "UpdateProfile function not implemented in default context"
    );
  },
};

const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("token");
    } catch (error) {
      console.error("Error reading token from localStorage", error);
      return null;
    }
  });
  const [user, setUser] = useState<UserData | null>(() => {
    try {
      const savedUserData = localStorage.getItem("userData");
      return savedUserData ? JSON.parse(savedUserData) : null;
    } catch (error) {
      console.error("Error reading user data from localStorage", error);
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const savedToken = localStorage.getItem("token");
        const savedUserData = localStorage.getItem("userData");
        if (savedToken && savedUserData) {
          setToken(savedToken);
          const parsedUserData = JSON.parse(savedUserData);
          setUser(parsedUserData);
        } else {
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("userData", JSON.stringify(user));
    }
  }, [token, user]);

  const login = useCallback(
    async (username: string, password: string) => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/login",
          {
            username,
            password,
          }
        );
        if (response.data && response.data.success) {
          const { token, user } = response.data;
          if (!token) {
            Swal.fire({
              icon: "error",
              title: "Error!",
              text: "Authentication token missing from server response.",
            });
            return false;
          }
          setToken(token);
          localStorage.setItem("token", token);
          if (!user) {
            Swal.fire({
              icon: "error",
              title: "Error!",
              text: "User data missing from server response.",
            });
            return false;
          }
          setUser(user);
          localStorage.setItem("userData", JSON.stringify(user));
          if (user.role === "admin") {
            navigate("/admin");
          } else if (user.role === "teacher") {
            navigate("/teacher");
          } else {
            navigate("/");
          }
        }
      } catch (error: Error | unknown) {
        let errorMessage = "Invalid Username or Password";
        if (axios.isAxiosError(error) && error.response) {
          if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (
            error.response.data &&
            typeof error.response.data === "string"
          ) {
            errorMessage = error.response.data;
          } else if (error.response.status === 401) {
            errorMessage = "Invalid username or password";
          }
        } else if (error instanceof Error && error.message) {
          errorMessage = error.message;
        }
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: errorMessage,
        });
        return false;
      }
    },
    [navigate]
  );

  const register = useCallback(
    async (userData: UserData) => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/register",
          userData
        );
        if (response.data.success) {
          Swal.fire({
            title: "Success!",
            text: response.data.message,
            icon: "success",
          });
          navigate("/login");
          return true;
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error instanceof Error ? error?.message : "Failed to register",
        });
        return false;
      }
    },
    [navigate]
  );

  const updateProfile = useCallback(
    async (userData: User) => {
      try {
        const response = await profileAPI.updateUserProfile(userData);
        if (response.success) {
          let updatedUser = response.user;
          if (!updatedUser || !updatedUser.role) {
            const profileResponse = await profileAPI.getUserProfile();
            updatedUser =
              profileResponse.data && profileResponse.data.user
                ? profileResponse.data.user
                : userData;
          }
          setUser(updatedUser);
          localStorage.setItem("userData", JSON.stringify(updatedUser));
          Swal.fire({
            title: "Success!",
            text: response.message,
            icon: "success",
          });
          return true;
        } else {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: response?.data?.message || "Failed to update profile",
          });
          return false;
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text:
            error instanceof Error
              ? error?.message
              : "Failed to update profile",
        });
        return false;
      }
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/login");
  }, [navigate]);

  const value = useMemo(
    () => ({
      token,
      user,
      isLoading,
      login,
      register,
      updateProfile,
      logout,
      isAdmin: user?.role === "admin",
    }),
    [token, user, isLoading, login, register, updateProfile, logout]
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
