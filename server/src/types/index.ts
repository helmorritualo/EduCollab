export type User = {
  user_id: number;
  username: string;
  password: string;
  email: string;
  full_name: string;
  phone_number: string;
  gender: string;
  role: string;
  is_active: boolean;
};

export type Group = {
  group_id: number;
  name: string;
  description: string;
  group_code: string;
  created_by: number;
};

export type GroupWithCreator = Group & {
  full_name: string;
};

export type Task = {
  task_id?: number;
  title: string;
  description: string;
  status: string;
  due_date: string;
  group_id: number;
  created_by: number;
  assigned_to: number | null;
  created_at?: string;
  updated_at?: string;
};

export type TaskWithDetails = Task & {
  group_name?: string;
  creator_name: string;
  assignee_name?: string;
};
