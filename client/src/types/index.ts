export type UserData = {
  username: string;
  email: string;
  full_name: string;
  phone_number: string;
  gender: string;
  address?: string;
  role?: string;
};

export type User = UserData &
  Partial<{
    user_id: number;
  }>;

export type AuthContextType = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean | undefined>;
  logout: () => void;
  register: (userData: UserData) => Promise<boolean | undefined>;
  updateProfile: (userData: User) => Promise<boolean | undefined>;
  isAdmin: boolean;
};

export interface Group {
  group_id: number;
  name: string;
  description: string;
  group_code?: string;
  created_by: number;
  creator_name: string;
}

export interface GroupMember {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  gender: string;
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
}

export interface TeacherInvitation {
  invitation_id: number;
  group_id: number;
  group_name: string;
  inviter_name: string;
  project_details: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}
