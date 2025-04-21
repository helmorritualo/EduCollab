/* eslint-disable react-refresh/only-export-components */
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
import { UserData, AuthContextType } from "@/types";
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
  isAdmin: () => {
    return false;
  }
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

        if (response.data.success) {
          const { token, user } = response.data;
          setToken(token);

          const profileResponse = await profileAPI.getUserProfile(user.user_id);

          const completeUser = profileResponse.data.user || user;
          setUserData(completeUser);

          if (completeUser.role === "admin") {
            navigate("/admin");
          } else if (completeUser.role === "teacher") {
            navigate("/teacher");
          } else {
            navigate("/student");
          }
          return true;
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text:
            error instanceof Error
              ? error?.message
              : "Invalid Username or Password",
        });
        return false;
      }
    },[setToken, setUserData, navigate]);

  const register = useCallback(
    async (userData: UserData) => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/register",
          userData
        );

        if (response.data.success) {
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
    }, [navigate]);

  const updateProfile = useCallback(
    async (user_id: number, userData: UserData) => {
      try {
        const response = await profileAPI.updateUserProfile(user_id, userData);

        if (response.data.success) {
          const updatedUser = { ...user, ...userData };
          setUserData(updatedUser);
          setUser(updatedUser);

          Swal.fire({
            title: "Success!",
            text: response.data.message,
            icon: "success"
          });
          return true;
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error instanceof Error? error?.message : "Failed to update profile",
        });
        return false;
      }
    }, [setUserData, setUser, user]);

  const logout = useCallback(() => {
    removeToken();
    removeUserData();
    clearAuthStorage();
    navigate("/login");
  }, [removeToken, removeUserData, clearAuthStorage, navigate]);

  const isAdminValue = useMemo(() => {
    return user?.role === "admin";
  }, [user]);

  const value = useMemo(
    () => ({
      token,
      user,
      isLoading,
      login,
      register,
      updateProfile,
      logout,
      isAdmin: () => isAdminValue,
    }), [token, user, isLoading, login, register, updateProfile, logout, isAdminValue]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
