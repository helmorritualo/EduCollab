import { useState, useCallback, useEffect } from 'react';

const TOKEN_KEY = 'token'; // Key for storing the token
const USER_DATA_KEY = 'user'; // Key for storing user data

interface UserData {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  phone_number: string;
  gender: 'male' | 'female';
  role: 'admin' | 'student' | 'teacher';
}

interface AuthStorage {
  token: string | null;
  setToken: (newToken: string) => void;
  removeToken: () => void;
  userData: UserData | null;
  setUserData: (newUserData: UserData) => void;
  removeUserData: () => void;
  clearAuthStorage: () => void; // Helper to clear everything
}

/**
 * Custom hook to manage authentication token and user data persistence in localStorage.
 * @returns An object containing the token, user data, and functions to manage them.
 */
export const useAuthStorage = (): AuthStorage => {

  //* --- Token Management ---
  const [token, setTokenState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("Error reading token from localStorage", error);
      return null;
    }
  });

  useEffect(() => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (error) {
      console.error("Error saving token to localStorage", error);
    }
  }, [token]);

  const setToken = useCallback((newToken: string) => {
    setTokenState(newToken);
  }, []);

  const removeToken = useCallback(() => {
    setTokenState(null);
  }, []);

  //* --- User Data Management ---
  const [userData, setUserDataState] = useState<UserData | null>(() => {
    try {
      const storedUserData = localStorage.getItem(USER_DATA_KEY);
      return storedUserData ? JSON.parse(storedUserData) : null;
    } catch (error) {
      console.error("Error reading user data from localStorage", error);
      localStorage.removeItem(USER_DATA_KEY); // Clear potentially corrupted data
      return null;
    }
  });

  useEffect(() => {
    try {
      if (userData) {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      } else {
        localStorage.removeItem(USER_DATA_KEY);
      }
    } catch (error) {
      console.error("Error saving user data to localStorage", error);
    }
  }, [userData]);

  const setUserData = useCallback((newUserData: UserData) => {
    setUserDataState(newUserData);
  }, []);

  const removeUserData = useCallback(() => {
    setUserDataState(null);
  }, []);

  //* --- Clear All ---
  const clearAuthStorage = useCallback(() => {
    removeToken();
    removeUserData();
  }, [removeToken, removeUserData]);


  return {
    token,
    setToken,
    removeToken,
    userData,
    setUserData,
    removeUserData,
    clearAuthStorage,
  };
};