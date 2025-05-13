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

export interface Subscription {
  id?: number;
  user_id: number;
  subscription_id: string;
  status: string;
  plan_id: string;
  start_date?: Date | string;
  next_billing_date?: Date | string;
  payment_id?: string;
  payer_id?: string;
  amount: number;
  created_at?: Date | string;
  updated_at?: Date | string;
  // For admin view - joined with user data
  username?: string;
  full_name?: string;
  email?: string;
  role?: string;
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

export interface FileUpload {
  file_id: number;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  task_id?: number | null;
  group_id: number;
  uploaded_by: number;
  uploaded_at: string;
  uploader: {
    username: string;
    full_name: string;
  };
  group: {
    name: string;
  };
}

export interface Task {
  task_id?: number;
  title: string;
  description: string;
  status: string;
  due_date: string;
  group_id: number;
  created_by: number;
  file?: FileUpload;
  created_at?: string;
  updated_at?: string;
}

export interface TaskWithDetails extends Task {
  group_name?: string;
  creator_name: string;
  assignment_status?: string;
}
