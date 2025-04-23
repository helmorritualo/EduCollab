export type UserData = {
  username: string;
  email: string;
  full_name: string;
  phone_number: string;
  gender: string;
  role: string;
};

export type User = UserData & Partial<{
  user_id: number;
}>; 

export type AuthContextType = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean | undefined>;
  logout: () => void;
  register: (userData: UserData) => Promise<boolean | undefined>;
  isAdmin: boolean;
};