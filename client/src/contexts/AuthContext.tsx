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
import { useAuthStorage } from "@/hooks/useAuthStorage";
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
};

const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const {
    token,
    setToken,
    removeToken,
    userData,
    setUserData,
    removeUserData,
    clearAuthStorage,
  } = useAuthStorage();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (token && userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, [token, userData]);

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

          // Ensure token exists
          if (!token) {
            console.error("Token missing from server response");
            Swal.fire({
              icon: "error",
              title: "Error!",
              text: "Authentication token missing from server response.",
            });
            return false;
          }

          setToken(token);

          // Handle case where user data might be missing
          if (!user) {
            console.error("User data missing from server response");
            Swal.fire({
              icon: "error",
              title: "Error!",
              text: "User data missing from server response.",
            });
            return false;
          }

          try {
            const profileResponse = await profileAPI.getUserProfile(
              user.user_id
            );
            const completeUser =
              profileResponse.data && profileResponse.data.user
                ? profileResponse.data.user
                : user;

            setUserData(completeUser);

            if (completeUser.role === "admin") {
              navigate("/admin");
            } else if (completeUser.role === "teacher") {
              navigate("/teacher");
            } else {
              navigate("/");
            }
            return true;
          } catch (profileError) {
            console.error("Error fetching user profile:", profileError);
            // Still set the basic user data we have
            setUserData(user);

            if (user.role === "admin") {
              navigate("/admin");
            } else if (user.role === "teacher") {
              navigate("/teacher");
            } else {
              navigate("/");
            }
            return true;
          }
        } else {
          console.error("Invalid response format:", response.data);
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: response.data?.message || "Login failed. Please try again.",
          });
          return false;
        }
      } catch (error: Error | unknown) {
        console.error("Login error:", error);

        // Improved error handling to capture server error messages
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
    [setToken, setUserData, navigate]
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
    async (user_id: number, userData: User) => {
      try {
        const response = await profileAPI.updateUserProfile(user_id, userData);

        if (response.data.success) {
          const updatedUser = response.data.user
            ? response.data.user
            : userData;
          setUserData(updatedUser);
          setUser(updatedUser);

          Swal.fire({
            title: "Success!",
            text: response.data.message,
            icon: "success",
          });
          return true;
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
    [setUserData, setUser]
  );

  const logout = useCallback(() => {
    removeToken();
    removeUserData();
    clearAuthStorage();
    navigate("/login");
  }, [removeToken, removeUserData, clearAuthStorage, navigate]);

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
