export type UserData = {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  phone_number: string;
  gender: "male" | "female";
  role: "admin" | "student" | "teacher";
};

export type AuthContextType = {
  token: string | null;
  user: UserData | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean | undefined>;
  logout: () => void;
  register: (userData: UserData) => Promise<boolean | undefined>;
  isAdmin: () => boolean;
};